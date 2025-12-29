import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GeminiService {
  constructor(
    @Inject('GEMINI') private readonly gemini: GoogleGenerativeAI,
    private readonly usersService: UsersService,
  ) {}

  async resumeTextExtraction(text: string, userId: string): Promise<string> {
    await this.usersService.userExistsById(userId);

    const model = this.gemini.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
You extract structured information from a resume.

Return JSON ONLY in this exact schema:

{
  "Name": "string",
  "Experience": "number | string", 
  "Skills": "string (comma-separated)",
  "Location": "string",
  "LinkedIn": "string",
  "Portfolio": "string",
  "Github": "string",
  "ExpectedSalary": "number | string",
  "Availability": "string",
  "message": "success"
}

STRICT RULES:
- If a field is numeric (Experience, ExpectedSalary), use a number when possible.
- If unsure, return empty string "".
- Never return null or undefined. Use "" if missing.
- No comments. No explanations. JSON only.
- But if the pdf uploaded is not a resume, return the message "not a resume" in the message field.
`;

    const result = await model.generateContent(
      `${prompt}\n\nResume text:\n${text}`,
    );

    return result.response.text();
  }

  async generateTailoredResume(
    resumeData: Record<string, any>,
    resumeText: string,
    userId: string,
    job: {
      title: string;
      description: string | null;
      requirements?: string | null;
      responsibilities?: string | null;
      company?: { name?: string | null } | null;
      location?: string | null;
    },
  ): Promise<string> {
    const user = await this.usersService.userExistsById(userId);
    if (!user.isPremium) {
      throw new UnauthorizedException(
        'User is not premium,Please upgrade to premium to use this feature',
      );
    }

    const model = this.gemini.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const systemPrompt = `
    You are an expert resume writer specializing in ATS-optimized, role-specific resumes. You must produce conversational resume sentences only—absolutely no headings, section labels, or bullet characters. Return JSON ONLY in this exact schema:
    
    {
      "personalInfo": string[],
      "introduction": string[],
      "projects": string[],
      "technicalSkills": string[],
      "keyHighlights": string[],
      "experiences": string[],
      "education": string[],
      "closingNotes": string[]
    }
    
    Rules:
    1. All fields must exist; if empty, use [].
    2. Each entry must be a vivid first-person description (1–2 sentences, ~18+ words) except entries inside "personalInfo".
    3. Never mention the candidate’s name outside "personalInfo"; everywhere else use first-person.
    4. Do NOT include bullets, numbers, markdown, ALL-CAPS labels, or quotation marks.
    5. "personalInfo" should list concise professional facts such as LinkedIn, GitHub, portfolio links, availability, travel/relocation readiness, or certifications—never include name, email, phone, or postal addresses here (those are already handled elsewhere).
    6. "introduction" first entry describes the candidate narrative; second entry explains why they fit this role/company, both using first-person prose and no labels.
    7. "projects" must reference only projects explicitly present in the resume data or full resume text; list the project name exactly as provided followed by impact/tech stack, ordered by relevance. If no projects are provided, return [].
    8. "technicalSkills" must be an array containing a single comma-separated string that packs in as many distinct, role-aligned skills from the resume as possible.
    9. "keyHighlights" spotlight achievements or differentiators tied to business results, written in first-person.
    10. "experiences" emphasize measurable impact, seniority, and context, written in first-person and without restating job requirements.
    11. "education" lists institutions, degrees, and notable accomplishments in sentence form.
    12. "closingNotes" explicitly reference the target job/company, tie back to the most relevant projects or experience, and read like a closing paragraph.
    13. Do not add extra fields or metadata. Output raw JSON only.
    14. Never write placeholder text like "N/A", "NA", "null", "undefined", "Not specified", "-", or similar. If information is missing, simply omit that sentence or leave the corresponding array empty.
    `;

    const userPrompt = `
    Resume data (JSON):
    ${JSON.stringify(resumeData, undefined, 2)}
    
    Full resume text:
    """
    ${resumeText}
    """
    
    Job information:
    Title: ${job.title}
    Company: ${job.company?.name ?? ''}
    Location: ${job.location ?? ''}
    Description: ${job.description ?? ''}
    Requirements: ${job.requirements ?? ''}
    Responsibilities: ${job.responsibilities ?? ''}
    
    Write a tailored resume following this order: personalInfo, introduction, projects, technicalSkills, keyHighlights, experiences, education, closingNotes. Do NOT use headings, labels, bullet characters, quotes, or third-person references—only first-person sentences that drop directly into a resume. After describing the candidate, immediately explain why they fit the role. Projects must match the ones provided in the resume data/text (leave the array empty if none are provided). Populate all arrays with concise, impactful sentences. Pack "technicalSkills" with as many relevant skills as possible. Closing notes must reference the target job/company and highlight alignment with key experience or projects.
    `;

    const result = await model.generateContent(
      `${systemPrompt}\n\n${userPrompt}`,
    );

    return result.response.text().trim();
  }
}
