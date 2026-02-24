import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import { ResumeTailoringService } from './resume-tailoring.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/role.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resume-tailoring')
export class ResumeTailoringController {
  constructor(private readonly resumeTailoringService: ResumeTailoringService) {}

  @Get(':jobId')
  @Roles('CANDIDATE')
  async tailorResume(
    @Param('jobId') jobId: string,
    @Req() req: any,
@Res() res: any
  ) {
    const userId = (req as any).userId;
    await this.resumeTailoringService.resumeTailoring(userId, jobId, res);
  }
}
