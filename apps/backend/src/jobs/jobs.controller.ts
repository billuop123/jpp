import { Body, Controller, Post, Req } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobDto, SearchDto } from './dto/jobs.dto';
import { Prisma } from '@repo/db';
@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) {}
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
}
