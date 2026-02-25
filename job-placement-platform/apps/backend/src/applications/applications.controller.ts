import { Body, Controller, Post, Req, Param, Patch, Get, UseGuards, SetMetadata } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationDto } from './dto/application.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/role.decorator';
import type  { Request } from 'express';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
    constructor(private readonly applicationsService:ApplicationsService){
        console.log("called")
    }
    @Roles('CANDIDATE')
    @Post()
    async create(@Body() application:ApplicationDto,@Req() req: Request) {
        return await this.applicationsService.create(application,req as any);
    }

    @Get('my-interviews')
    async listMyInterviews(@Req() req: Request) {
        return await this.applicationsService.listMyInterviews(
            req.userId as string,
        );
    }
    @Get('my-applications')
    async listMyApplications(@Req() req: Request) {
        return await this.applicationsService.listMyApplications(
            req.userId as string,
        );
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
    @Get('user-details/:userId')
    async getUserDetails(@Param('userId') userId: string) {
        return await this.applicationsService.getUserDetails(userId);
    }
    @Get('my-status/:jobId')
    async getMyApplicationStatus(@Param('jobId') jobId: string, @Req() req: Request) {
        return await this.applicationsService.getMyApplicationStatus(jobId, req.userId as string);
    }
    @Get(':applicationId')

    async getApplication(@Param('applicationId') applicationId: string, @Req() req: Request) {
        return await this.applicationsService.getApplicationWithJob(applicationId, req.userId as string);
    }
    @Patch(':applicationId/analyze')
    async analyzeInterview(@Param('applicationId') applicationId: string, @Req() req: Request) {
        return await this.applicationsService.analyzeInterview(applicationId, req.userId as string);
    }
    @Get(':applicationId/interview-exists')
    async interviewExists(@Param('applicationId') applicationId: string) {
        return await this.applicationsService.interviewExists(applicationId);
    }
}
