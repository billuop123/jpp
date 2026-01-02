import { Controller, Get, Patch, Param, Query, Post } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}
    @Get('recruiters')
    async getRecruiters(@Query('page') page:number=1,@Query('limit') limit:number=10){
        return await this.adminService.getRecruiters(page,limit);
    }
    @Get('candidates')
    async getCandidates(@Query('page') page:number=1,@Query('limit') limit:number=10){
        return await this.adminService.getCandidates(page,limit);
    }
    @Get('unverified-companies')
    async getUnverifiedCompanies(@Query('page') page:number=1,@Query('limit') limit:number=10){
        return await this.adminService.getUnverifiedCompanies(page,limit);
    }
    @Patch('verify-company/:id')
    async verifyCompany(@Param('id') id: string) {
        return await this.adminService.verifyCompany(id);
    }
    @Post('jobs/clear')
    async clearJobsFromBothDbs() {
        return await this.adminService.clearJobsFromBothDbs();
    }

    @Post('jobs/sync')
    async syncJobsToQdrant() {
        return await this.adminService.syncJobsToQdrant();
    }
}
