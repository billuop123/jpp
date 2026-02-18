import { Body, Controller, Post, Req } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ResumeTextExtractionDto } from 'src/openai/dto/resume.dto';

@Controller('gemini')
export class GeminiController {
    constructor(private readonly geminiService: GeminiService) {}
    @Post('resume-text-extraction')
    async resumeTextExtraction(@Body() body: ResumeTextExtractionDto, @Req() req: Request) {
        return await this.geminiService.resumeTextExtraction(body.text, (req as any).userId as string);
    }
}
