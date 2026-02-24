import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { PDFParse } from 'pdf-parse';
import { DatabaseService } from 'src/database/database.service';
import { GeminiService } from 'src/gemini/gemini.service';

type ResumeExtractionResult = {
    Name?: string;
    Experience?: string | number;
    Skills?: string;
    Location?: string;
    LinkedIn?: string;
    Portfolio?: string;
    Github?: string;
    ExpectedSalary?: string | number;
    Availability?: string;
    message?: string;
};

type TailoredResumeContent = {
    personalInfo: string[];
    introduction: string[];
    projects: string[];
    technicalSkills: string[];
    keyHighlights: string[];
    experiences: string[];
    education: string[];
    closingNotes: string[];
};

@Injectable()
export class ResumeTailoringService {
    constructor(
        private readonly geminiService: GeminiService,
        private readonly databaseService: DatabaseService,
    ) {}

    async resumeTailoring(userId: string, jobId: string, res: Response) {
        const user = await this.databaseService.users.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const job = await this.databaseService.jobs.findUnique({
            where: { id: jobId },
            include: {
                company: {
                    select: { name: true },
                },
            },
        });
        if (!job) {
            throw new NotFoundException('Job not found');
        }

        const userDetails = await this.databaseService.userDetails.findUnique({
            where: { userId },
            select: {
                resumeLink: true,
                experience: true,
                location: true,
                linkedin: true,
                portfolio: true,
                github: true,
                expectedSalary: true,
                availability: true,
                skills: true,
            },
        });

        if (!userDetails?.resumeLink) {
            throw new NotFoundException('Upload your resume first');
        }

        const resumePdfText = await this.extractResumeText(userDetails.resumeLink);
        if (!resumePdfText?.trim()) {
            throw new BadRequestException('Unable to read resume');
        }

        const resumeExtractionRaw = await this.geminiService.resumeTextExtraction(resumePdfText,userId);
        if (!resumeExtractionRaw) {
            throw new BadRequestException('Failed to process resume');
        }

        let resumeExtraction: ResumeExtractionResult;
        try {
            resumeExtraction = JSON.parse(resumeExtractionRaw);
        } catch (error) {
            throw new BadRequestException('Resume parsing failed');
        }

        if (resumeExtraction.message === 'not a resume') {
            throw new BadRequestException('The uploaded file is not a resume');
        }

        const aiResponse = await this.geminiService.generateTailoredResume(resumeExtraction, resumePdfText, userId,job);
        const structuredResume = this.parseStructuredResume(aiResponse);
        if (!structuredResume) {
            throw new BadRequestException('Unable to generate tailored resume content');
        }

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
        doc.pipe(res);

        this.writeHeader(doc, resumeExtraction, user, userDetails);
        this.writeTailoredContent(doc, structuredResume);

        doc.end();

        await new Promise<void>((resolve, reject) => {
            doc.on('finish', () => resolve());
            doc.on('error', (err) => reject(new BadRequestException(err.message)));
        });
    }

    /**
     * Normalizes and removes placeholder-like values such as
     * "N/A", "NA", "null", "undefined", "Not specified", "-", etc.
     * Returns an empty string when a value should be treated as missing.
     */
    private sanitizePlaceholder(value: string | null | undefined): string {
        if (!value) {
            return '';
        }
        const trimmed = value.trim();
        if (!trimmed) {
            return '';
        }
        const lowered = trimmed.toLowerCase();
        const compact = lowered.replace(/[\s._\-\/]/g, '');
        const placeholders = new Set([
            'n/a',
            'na',
            'notapplicable',
            'notavailable',
            'notprovided',
            'nospecified',
            'notspecified',
            'unknown',
            'none',
            'null',
            'undefined',
            '-',
            '--',
        ]);
        if (placeholders.has(lowered) || placeholders.has(compact)) {
            return '';
        }
        return trimmed;
    }

    private async extractResumeText(resumeLink: string) {
        try {
            const parser = new PDFParse({ url: resumeLink });
            const parsed = await parser.getText();
            return parsed.text;
        } catch (error) {
            throw new BadRequestException('Failed to read resume file');
        }
    }

    private writeHeader(
        doc: PDFDocument,
        resume: ResumeExtractionResult,
        user: { name: string | null; email: string | null },
        details: {
            location?: string | null;
            linkedin?: string | null;
            portfolio?: string | null;
            github?: string | null;
        },
    ) {
        const displayName =
            this.sanitizePlaceholder(resume.Name) ||
            this.sanitizePlaceholder(user.name) ||
            'Candidate';
        const addressLine =
            this.sanitizePlaceholder(details.location) ||
            this.sanitizePlaceholder(resume.Location) ||
            '';

        doc
            .font('Helvetica-Bold')
            .fontSize(22)
            .text(displayName, { align: 'right' });

        if (addressLine) {
            doc.font('Helvetica').fontSize(11).text(addressLine, { align: 'right' });
        }

        const contactSegments = [
            this.sanitizePlaceholder(user.email),
            this.sanitizePlaceholder(resume.LinkedIn || details.linkedin),
            this.sanitizePlaceholder(resume.Portfolio || details.portfolio),
            this.sanitizePlaceholder(resume.Github || details.github),
        ]
            .flat()
            .filter(Boolean)
            .map((segment) => (segment as string).trim());

        if (contactSegments.length) {
            doc
                .font('Helvetica')
                .fontSize(10)
                .fillColor('#4b5563')
                .text(contactSegments.join('  •  '), { align: 'right' });
            doc.fillColor('#000000');
        }

        doc.moveDown(1);
    }

    private writeTailoredContent(doc: PDFDocument, content: TailoredResumeContent) {
        this.writeFreeformSection(doc, content.introduction);
        this.writeStructuredSection(doc, 'PROJECTS', content.projects);
        this.writeStructuredSection(doc, 'TECHNICAL SKILLS', content.technicalSkills);
        this.writeStructuredSection(doc, 'EXPERIENCE', content.experiences);
        this.writeStructuredSection(doc, 'EDUCATION', content.education);
    }
    private parseStructuredResume(payload: string): TailoredResumeContent | null {
        if (!payload?.trim()) {
            return null;
        }
        try {
            const parsed = JSON.parse(payload);
            if (
                Array.isArray(parsed.personalInfo) &&
                Array.isArray(parsed.introduction) &&
                Array.isArray(parsed.projects) &&
                Array.isArray(parsed.technicalSkills) &&
                Array.isArray(parsed.keyHighlights) &&
                Array.isArray(parsed.experiences) &&
                Array.isArray(parsed.education) &&
                Array.isArray(parsed.closingNotes)
            ) {
                const clean = (arr: unknown[]): string[] =>
                    arr
                        .map((item) => this.sanitizePlaceholder(String(item).trim()))
                        .filter((val): val is string => Boolean(val));

                return {
                    personalInfo: clean(parsed.personalInfo),
                    introduction: clean(parsed.introduction),
                    projects: clean(parsed.projects),
                    technicalSkills: clean(parsed.technicalSkills),
                    keyHighlights: clean(parsed.keyHighlights),
                    experiences: clean(parsed.experiences),
                    education: clean(parsed.education),
                    closingNotes: clean(parsed.closingNotes),
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    private formatExperienceLabel(experience?: string | number | null): string {
        if (typeof experience === 'number') {
            if (experience <= 0) {
                return 'entry-level experience';
            }
            if (experience === 1) {
                return '1 year of experience';
            }
            return `${experience}+ years of experience`;
        }
        if (typeof experience === 'string') {
            const trimmed = experience.trim();
            if (!trimmed || trimmed === '0' || /^0\+?\s*years?/i.test(trimmed)) {
                return 'entry-level experience';
            }
            return /experience|years?/i.test(trimmed) ? trimmed : `${trimmed} experience`;
        }
        return 'relevant experience';
    }

    private filterPersonalInfo(entries: string[]) {
        const allowedKeywords = [
            'linkedin',
            'github',
            'portfolio',
            'website',
            'behance',
            'dribbble',
            'availability',
            'available',
            'relocation',
            'travel',
            'visa',
            'work authorization',
            'clearance',
            'citizenship',
            'language',
            'languages',
            'timezone',
            'time zone',
            'pronouns',
            'blog',
        ];
        return entries
            .map((entry) => entry.trim())
            .filter(Boolean)
            // Clean lines like "LinkedIn: N/A" → drop if value is placeholder,
            // or normalize to "LinkedIn: <actual value>".
            .map((entry) => {
                if (!entry.includes(':')) {
                    return entry;
                }
                const [label, ...rest] = entry.split(':');
                const rawValue = rest.join(':').trim();
                const cleanedValue = this.sanitizePlaceholder(rawValue);
                if (!cleanedValue) {
                    // No meaningful value after the label, drop this entry entirely
                    return '';
                }
                return `${label.trim()}: ${cleanedValue}`;
            })
            .filter(Boolean)
            .filter((entry) => {
                const lowered = entry.toLowerCase();
                if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(entry)) {
                    return false;
                }
                if (this.looksLikePostalAddress(lowered)) {
                    return false;
                }
                if (entry.includes(':')) {
                    return true;
                }
                if (allowedKeywords.some((keyword) => lowered.includes(keyword))) {
                    return true;
                }
                if (lowered.includes('http')) {
                    return true;
                }
                return false;
            });
    }

    private looksLikePostalAddress(text: string) {
        if (!text) {
            return false;
        }
        const addressKeywords = [
            'street',
            'road',
            'rd',
            'ave',
            'avenue',
            'block',
            'apt',
            'suite',
            'lane',
            'drive',
            'dr',
            'city',
            'state',
            'zip',
            'postal',
            'nepal',
            'india',
            'usa',
            'canada',
            'district',
            'ward',
            'address',
        ];
        return (
            /\d{3,}/.test(text) &&
            addressKeywords.some((keyword) => text.includes(keyword))
        );
    }

    private writeFreeformSection(doc: PDFDocument, lines: string[]) {
        if (!lines.length) {
            return;
        }
        lines.forEach((line, index) => {
            doc.font('Helvetica').fontSize(11).text(line, { align: 'justify' });
            if (index < lines.length - 1) {
                doc.moveDown(0.2);
            }
        });
        doc.moveDown(0.6);
    }

    private writeStructuredSection(doc: PDFDocument, heading: string, bullets: string[]) {
        if (!bullets.length) {
            return;
        }
        doc.font('Helvetica-Bold').fontSize(14).text(heading, { align: 'center' });

        const lineY = doc.y + 2;
        const startX = doc.page.margins.left;
        const endX = doc.page.width - doc.page.margins.right;
        doc.moveTo(startX, lineY).lineTo(endX, lineY).lineWidth(1).stroke('#9ca3af');
        doc.moveDown(0.4);

        bullets.forEach((bullet) => {
            doc
                .font('Helvetica')
                .fontSize(11)
                .text(`• ${bullet}`, { align: 'justify' });
        });
        doc.moveDown(0.6);
    }
}
