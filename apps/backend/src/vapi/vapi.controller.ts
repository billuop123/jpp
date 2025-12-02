import { Body, Controller, Get, Post, Param, Req } from '@nestjs/common';
import { VapiService } from './vapi.service';

@Controller('vapi')
export class VapiController {
    constructor(private readonly vapiService: VapiService) {}
    @Get('get-assistants')
    async getAssistants() {
        return await this.vapiService.getAssistants();
    }
    @Post('call-assistant')
    async callAssistant(@Body() body: { assistant:any, jobId: string },@Req() req:Request) {
        return await this.vapiService.callAssistant(body.assistant, body.jobId,(req as any).userId as string);
    }
    @Get('client-key')
    async getClientKey(@Req() req:Request) {
        return await this.vapiService.getClientKey((req as any).userId as string);
    }
    @Post('call-assistant/:applicationId')
    async callAssistantByApplicationId(@Param('applicationId') applicationId: string, @Body() body: { assistant?:any },@Req() req:Request) {
        return await this.vapiService.callAssistantByApplicationId(applicationId, body.assistant,(req as any).userId as string);
    }
    @Post('save-conversation/:applicationId')
    async saveConversation(@Param('applicationId') applicationId: string, @Body() body: { conversationHistory: string }, @Req() req:Request) {
        return await this.vapiService.saveConversationHistory(applicationId, body.conversationHistory, (req as any).userId as string);
    }
}
