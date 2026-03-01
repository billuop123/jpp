import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { MockInterviewsService } from './mock-interviews.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import  type { Request } from 'express';
import { JobIdDto } from './dto/jobId.dto';
import { ConversationHistoryDto } from './dto/coversationHistory.dto';

@UseGuards(JwtAuthGuard)
@Controller('mock-interviews')
export class MockInterviewsController {
  constructor(private readonly mockInterviewsService: MockInterviewsService) {}

  @Post('start')
  async startMockInterview(
    @Body() body: JobIdDto,
    @Req() req: Request,
  ) {
    const userId = req.userId as string;
    return await this.mockInterviewsService.startMockInterview(body.jobId, userId);
  }

  @Post(':mockInterviewId/conversation')
  async saveConversation(
    @Param('mockInterviewId') mockInterviewId: string,
    @Body() body: ConversationHistoryDto,
    @Req() req: Request,
  ) {
    const userId = req.userId as string;
    return await this.mockInterviewsService.saveConversation(
      mockInterviewId,
      userId,
      body.conversationHistory,
    );
  }

  @Patch(':mockInterviewId/analyze')
  async analyzeMockInterview(
    @Param('mockInterviewId') mockInterviewId: string,
    @Req() req: Request,
  ) {
    const userId = req.userId as string;
    return await this.mockInterviewsService.analyzeMockInterview(
      mockInterviewId,
      userId,
    );
  }

  @Get(':mockInterviewId')
  async getMockInterview(
    @Param('mockInterviewId') mockInterviewId: string,
    @Req() req: Request,
  ) {
    const userId = req.userId as string;
    return await this.mockInterviewsService.getMockInterview(
      mockInterviewId,
      userId,
    );
  }

  @Get()
  async listMyMockInterviews(@Req() req: Request) {
    const userId = req.userId as string;
    return await this.mockInterviewsService.listMyMockInterviews(userId);
  }
}

