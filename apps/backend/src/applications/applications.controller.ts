import { Body, Controller, Post, Req, Param, Patch, Get } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationDto } from './dto/application.dto';
import { IsCandidate } from 'src/roles/roles.middleware';

@Controller('applications')
export class ApplicationsController {
    constructor(private readonly applicationsService:ApplicationsService){}
    @Post()
    async create(@Body() application:ApplicationDto,@Req() req: Request) {
        return await this.applicationsService.create(application,req as any);
    }
    @Get(':applicationId')
    async getApplication(@Param('applicationId') applicationId: string, @Req() req: Request) {
        return await this.applicationsService.getApplicationWithJob(applicationId, (req as any).userId as string);
    }
    @Patch(':applicationId/analyze')
    async analyzeInterview(@Param('applicationId') applicationId: string, @Req() req: Request) {
        return await this.applicationsService.analyzeInterview(applicationId, (req as any).userId as string);
    }
    @Get(':applicationId/interview-exists')
    async interviewExists(@Param('applicationId') applicationId: string) {
        return await this.applicationsService.interviewExists(applicationId);
    }
    @Get('recruiter/:jobId')
    async getRecruiterApplications(@Param('jobId') jobId: string) {
        return await this.applicationsService.getRecruiterApplications(jobId);
    }
    @Get('scoring-list/:jobId')
    async getScoringList(@Param('jobId') jobId: string) {
        return await this.applicationsService.getScoringList(jobId);
    }
    @Get('user-application-details/:jobId/:userId')
    async getUserApplicationDetails(@Param('jobId') jobId: string, @Param('userId') userId: string) {
        return await this.applicationsService.getUserApplicationDetails(jobId, userId);
    }
}
