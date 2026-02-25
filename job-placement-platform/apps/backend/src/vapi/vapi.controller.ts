import { Body, Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { VapiService } from './vapi.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CallAssistantDto } from './Dto/call-assistant-dto';
import { AssistantJobDto } from './Dto/call-assistantbyid-dto';
import type { Request } from 'express';
@UseGuards(JwtAuthGuard)
@Controller('vapi')
export class VapiController {
    constructor(private readonly vapiService: VapiService) {}
    @Get('get-assistants')
    async getAssistants() {
        return await this.vapiService.getAssistants();
    }
    @Post('call-assistant')
  async callAssistant(@Body() body: CallAssistantDto,@Req() req:Request) {
    return await this.vapiService.callAssistant(
      body.assistant,
      body.jobId,
      req.userId as string,
      body.mode ?? 'real',
    );
    }
    @Get('client-key')
    async getClientKey(@Req() req:Request) {
        return await this.vapiService.getClientKey(req.userId as string);
    }
    @Post('call-assistant/:applicationId')
  async callAssistantByApplicationId(
    @Param('applicationId') applicationId: string,
    @Body() body: AssistantJobDto,
    @Req() req:Request
  ) {
    return await this.vapiService.callAssistantByApplicationId(
      applicationId,
      body.assistant,
      req.userId as string,
      body.mode ?? 'real',
    );
    }
    @Post('save-conversation/:applicationId')
    async saveConversation(@Param('applicationId') applicationId: string, @Body() body: { conversationHistory: string }, @Req() req:Request) {
        return await this.vapiService.saveConversationHistory(applicationId, body.conversationHistory, req.userId as string);
    }
}
