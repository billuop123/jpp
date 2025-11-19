import { Body, Controller, Post } from '@nestjs/common';
import { ResumeTextExtractionDto } from './dto/resume.dto';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
    constructor(private readonly openaiService:OpenaiService){}
    @Post('resume-text-extraction')
    async resumeTextExtraction(@Body() body:ResumeTextExtractionDto){
        return await this.openaiService.resumeTextExtraction(body.text);
    }
}