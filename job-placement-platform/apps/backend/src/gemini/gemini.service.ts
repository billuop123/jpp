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
    const hasTailoringAccess =
      user.isPremium || user.isTailoringPremium;

    if (!hasTailoringAccess) {
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
    15. CRITICAL: Adapt role titles and descriptions to match the target job ONLY if the roles are in the same domain. Examples of same domain: Full Stack Developer ↔ Frontend Developer ↔ Backend Developer ↔ Software Engineer; DevOps Engineer ↔ Site Reliability Engineer; Data Scientist ↔ ML Engineer ↔ AI Engineer. DO NOT reframe roles across different domains (e.g., AI Engineer applying for Web Developer should remain AI Engineer, not be changed to Web Developer). Only reframe when the candidate's background is clearly transferable and in the same technical domain.
    16. CRITICAL: Completely omit skills, technologies, projects, and experiences that are irrelevant to the target job. For example, if applying for a Frontend Developer role, omit machine learning skills, data science projects, or backend-heavy experiences. Only include information that directly supports the target role. Be ruthless in filtering out irrelevant content.
    17. Prioritize and emphasize skills, technologies, and experiences that are most relevant to the target job title.
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
    
    Write a tailored resume for the "${job.title}" position following this order: introduction, projects, technicalSkills, experiences, education. 
    
    CRITICAL RULES:
    1. NEVER mention the company name (${job.company?.name ?? ''}) anywhere in the resume
    2. NO weak words: "aspiring", "learning", "trying", "hoping", "passionate", "motivated"
    3. NO generic phrases: "team player", "hard worker", "fast learner"
    4. DO NOT include "Personal Info", "Availability", or "Key Highlights" sections
    5. Every sentence must be ACTION-DRIVEN with MEASURABLE IMPACT
    6. NO repetition - each bullet must add unique technical value
    
    INTRODUCTION (2-3 sentences max):
    - Lead with years of experience and core expertise
    - Mention specific technologies/domains
    - State quantifiable achievements (e.g., "Built systems serving 100K+ users")
    - Example: "Software engineer with 3 years building scalable web applications using React and Node.js. Architected microservices handling 50K requests/day with 99.9% uptime."
    
    PROJECTS (4-6 bullets, each must include):
    - Action verb + what you built + scale/impact
    - Architecture decisions and technical depth
    - Technologies used (in parentheses)
    - Measurable outcome: performance, users, efficiency gain
    - Example: "Architected microservices-based e-commerce platform handling 50K daily transactions (Node.js, PostgreSQL, Redis). Implemented event-driven architecture reducing order processing time by 65%."
    - NOT: "Created a chat app for users to communicate" (too vague)
    - Focus on: system design, scalability, performance optimization, technical challenges solved
    
    TECHNICAL SKILLS (categorize clearly):
    Languages: [list]
    Frameworks & Libraries: [list]
    Tools & Platforms: [list]
    Databases: [list]
    Cloud & DevOps: [list]
    - Only include skills relevant to "${job.title}"
    - Use consistent formatting (no mixing styles)
    
    EXPERIENCE (4-5 bullets per role):
    - Job title, duration (if available from resume)
    - Each bullet: action verb + technical responsibility + architecture/design decision + measurable impact
    - Show real engineering work: "Designed and implemented...", "Architected...", "Optimized..."
    - Include technical depth: algorithms used, system design choices, performance improvements
    - Example: "Redesigned authentication system using JWT and Redis session store, reducing login latency from 800ms to 120ms and supporting 10K concurrent users"
    - NOT: "Worked on authentication feature" (too vague)
    
    EDUCATION:
    - Degree, Institution (if available)
    - Keep brief, no descriptions
    
    ROLE REFRAMING:
    - Only reframe if same technical domain (Full Stack → Frontend/Backend, DevOps → SRE)
    - Different domains: keep original role (AI Engineer stays AI Engineer)
    
    FILTERING:
    - Completely OMIT irrelevant skills, technologies, projects, or experiences
    - Be ruthless: if it doesn't support "${job.title}", remove it
    
    Do NOT use headings, labels, bullet characters, quotes, or third-person references—only first-person sentences. Write like a senior engineer with proven impact. Focus on technical depth and architecture decisions, not generic descriptions.
    `;

    const result = await model.generateContent(
      `${systemPrompt}\n\n${userPrompt}`,
    );

    return result.response.text().trim();
  }
}
