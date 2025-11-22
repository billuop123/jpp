import { Body, Controller, Get, Post, Req, Query, Param } from '@nestjs/common';
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
    @Post()
    async create(@Body() job:JobDto, @Req() req: Request): Promise<Prisma.jobsGetPayload<{}>> {
        return await this.jobsService.create(job,req as any);
    }
    @Post('search')
    async search(@Body() searchDto: SearchDto) {
        return await this.jobsService.search(searchDto.query);
    }
    @Post('search-jobs')
    async searchJobs(@Body() searchDto: SearchDto) {
        return await this.jobsService.searchJobs(searchDto.query);
    }
    @Get(':jobId')
    async findOneJob(@Param('jobId') jobId: string) {
        return await this.jobsService.findOneJob(jobId);
    }
}
