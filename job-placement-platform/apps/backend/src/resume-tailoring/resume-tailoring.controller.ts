import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ResumeTailoringService } from './resume-tailoring.service';

@Controller('resume-tailoring')
export class ResumeTailoringController {
  constructor(private readonly resumeTailoringService: ResumeTailoringService) {}

  @Get(':jobId')
  async tailorResume(
    @Param('jobId') jobId: string,
    @Req() req: any,
@Res() res: any
  ) {
    const userId = (req as any).userId;
    await this.resumeTailoringService.resumeTailoring(userId, jobId, res);
  }
}
