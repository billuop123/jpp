import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyDto } from './dto/create-company.dto';

@Controller('company')
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}
    @Post()
    async create(@Body() company:CompanyDto, @Req() req: Request) {
        return await this.companyService.create(company,req as any);
    }
    @Get('my-companies')
    async getMyCompanies(@Req() req: Request) {
        return await this.companyService.getMyCompanies(req as any);
    }
    @Get('company-jobs/:companyId')
    async getCompanyJobs(@Param('companyId') companyId: string, @Req() req: Request) {
        return await this.companyService.getCompanyJobs(companyId,req as any);
    }
    @Get(':companyId')
    async getCompany(@Param('companyId') companyId: string, @Req() req: Request) {
        return await this.companyService.getCompany(companyId, (req as any).userId);
    }
}
