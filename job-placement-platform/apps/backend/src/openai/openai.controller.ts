import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ResumeTextExtractionDto } from './dto/resume.dto';
import { OpenaiService } from './openai.service';
import type { Request } from 'express';

@Controller('openai')
export class OpenaiController {
    constructor(private readonly openaiService:OpenaiService){}
    @Post('resume-text-extraction')
    async resumeTextExtraction(@Body() body:ResumeTextExtractionDto,@Req() req: Request){
        return await this.openaiService.resumeTextExtraction(body.text,req.userId as string);
    }
    @Get('get-eph-key')
    async getEphimeralKey(@Req() req: Request){
        return await this.openaiService.getEphimeralKey();
    }
}