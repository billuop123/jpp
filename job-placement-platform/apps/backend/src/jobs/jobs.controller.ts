import { Body, Controller, Get, Post, Req, Query, Param, Patch, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobDto } from './dto/jobs.dto';
import { Prisma } from '@repo/db';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SearchDto } from './dto/search-job.dto';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) {}
    // @Get()
    // async findAll(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    //     return await this.jobsService.findAll(
    //         limit ? parseInt(limit, 10) : undefined,
    //         offset ? parseInt(offset, 10) : undefined
    //     );
    // }
    @UseGuards(JwtAuthGuard)
    @Post('application-exists')
    async applicationExists(@Body()jobId: {jobId:string},@Req() req:Request){
        return await this.jobsService.applicationExists(jobId,req as any);
    }


    @Post('search')
    async search(@Body() searchDto: SearchDto) {
        return await this.jobsService.search(searchDto.query);
    }
    @Post('search-jobs')
    async searchJobs(@Body() searchDto: SearchDto) {
        return await this.jobsService.searchJobs(searchDto.query);
    }
      @Get('types')
      async getJobTypes(){
          return await this.jobsService.getJobTypes();
      }
    @Get('top-viewed-jobs')
    async getTopViewedJobs() {
        return await this.jobsService.getTopViewedJobs();
    }
    @Post('regenerate-embeddings')
    async regenerateEmbeddings() {
        return await this.jobsService.regenerateEmbeddings();
    }
    @UseGuards(JwtAuthGuard)
    @Get('pending-requests/:jobId')
    async getPendingRequests(@Param('jobId') jobId: string) {
        return await this.jobsService.getPendingRequests(jobId);
    }
    @UseGuards(JwtAuthGuard)
    @Patch('update-request-status/:applicationId')
    async updateRequestStatus(@Param('applicationId') applicationId: string) {
        return await this.jobsService.updateRequestStatus(applicationId);
    }
    @Patch('update-views/:jobId')
    async updateViews(@Param('jobId') jobId: string, @Req() req: Request) {
        return await this.jobsService.updateViews(jobId,req as any);
    }
    @Get(':jobId')
    async findOneJob(@Param('jobId') jobId: string) {
        return await this.jobsService.findOneJob(jobId);
    }
    @UseGuards(JwtAuthGuard)
    @Post(':companyId')
    async create(@Body() job:JobDto, @Req() req: Request,@Param('companyId') companyId: string): Promise<Prisma.jobsGetPayload<{}>> {
        return await this.jobsService.create(job,req as any,companyId as string);
    }

}
