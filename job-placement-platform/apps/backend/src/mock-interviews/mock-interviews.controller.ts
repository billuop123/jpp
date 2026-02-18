import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { MockInterviewsService } from './mock-interviews.service';

@Controller('mock-interviews')
export class MockInterviewsController {
  constructor(private readonly mockInterviewsService: MockInterviewsService) {}

  @Post('start')
  async startMockInterview(
    @Body() body: { jobId: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).userId as string;
    return await this.mockInterviewsService.startMockInterview(body.jobId, userId);
  }

  @Post(':mockInterviewId/conversation')
  async saveConversation(
    @Param('mockInterviewId') mockInterviewId: string,
    @Body() body: { conversationHistory: string },
    @Req() req: Request,
  ) {
    const userId = (req as any).userId as string;
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
    const userId = (req as any).userId as string;
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
    const userId = (req as any).userId as string;
    return await this.mockInterviewsService.getMockInterview(
      mockInterviewId,
      userId,
    );
  }

  @Get()
  async listMyMockInterviews(@Req() req: Request) {
    const userId = (req as any).userId as string;
    return await this.mockInterviewsService.listMyMockInterviews(userId);
  }
}

