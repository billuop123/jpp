import { Body, Controller, Post, Req } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyDto } from './dto/create-company.dto';

@Controller('company')
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}
    @Post()
    async create(@Body() company:CompanyDto, @Req() req: Request) {
        return await this.companyService.create(company,req as any);
    }
}
