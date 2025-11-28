import { Body, Controller, Get, Post, Req, Query, Param, Patch } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobDto, SearchDto } from './dto/jobs.dto';
import { Prisma } from '@repo/db';
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
    @Get('top-viewed-jobs')
    async getTopViewedJobs() {
        return await this.jobsService.getTopViewedJobs();
    }
    @Patch('update-views/:jobId')
    async updateViews(@Param('jobId') jobId: string, @Req() req: Request) {
        return await this.jobsService.updateViews(jobId,req as any);
    }
    @Get(':jobId')
    async findOneJob(@Param('jobId') jobId: string) {
        return await this.jobsService.findOneJob(jobId);
    }
    @Post(':companyId')
    async create(@Body() job:JobDto, @Req() req: Request,@Param('companyId') companyId: string): Promise<Prisma.jobsGetPayload<{}>> {
        return await this.jobsService.create(job,req as any,companyId as string);
    }

}
