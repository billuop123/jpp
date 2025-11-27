import { Body, Controller, Post, Req } from '@nestjs/common';
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
    
}
