import { Inject, Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  constructor(@Inject('OPENAI') private readonly openai: OpenAI) {}

  async resumeTextExtraction(text: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },   
      messages: [
        {
          role: 'system',
          content: `
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
`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
    });

    return response.choices[0].message.content;
  }
}
