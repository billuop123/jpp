import { Body, Controller, Get, Post, Req } from '@nestjs/common';
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
}
