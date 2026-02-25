import { Body, Controller, Get, Param, Post, Put, UseInterceptors, Req, BadRequestException, UploadedFile, Query, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyDto } from './dto/create-company.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

const pdfFileFilter = (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.includes('pdf')) {
      cb(new BadRequestException('Only PDF files are allowed'), false);
    } else {
      cb(null, true);
    }
  };

@UseGuards(JwtAuthGuard)
@Controller('company')
export class CompanyController {
    constructor(private readonly companyService: CompanyService, private readonly cloudinaryService: CloudinaryService) {}

    @Put('upload-incorporation-pdf/:companyId')
    @UseInterceptors(
      FileInterceptor('file', {
        storage: memoryStorage(),
        fileFilter: pdfFileFilter,
        limits: { fileSize: 20 * 1024 * 1024 },
      }),
    )
    async uploadIncorporationPdf(@Req() req: Request, @UploadedFile() file: any, @Param('companyId') companyId: string) {
        if (!file) throw new BadRequestException('No file uploaded');
        return await this.cloudinaryService.uploadCompanyIncorporationPdf(file, req as any, companyId);
      }
    
    @Post()
    async create(@Body() company:CompanyDto, @Req() req: Request) {
        return await this.companyService.create(company,req as any);
    }
      @Get('types')
      async getCompanyTypes() {
          return await this.companyService.getCompanyTypes();
      }
    @Get('my-companies')
    async getMyCompanies(@Req() req: Request) {
        return await this.companyService.getMyCompanies(req as any);
    }
    @Get('company-jobs/:companyId')
    async getCompanyJobs(@Param('companyId') companyId: string, @Req() req: Request) {
        return await this.companyService.getCompanyJobs(companyId,req as any);
    }
  @Get()
  async getCompanyByQuery(@Query('companyId') companyId: string, @Req() req: Request) {
      return await this.companyService.getCompany(companyId, (req as any).userId);
  }
    @Get(':companyId')
  async getCompany(@Param('companyId') companyId: string, @Req() req: Request) {
      const params = (req as any).params || {};
      const effectiveCompanyId = companyId || params.companyId;
      return await this.companyService.getCompany(effectiveCompanyId, (req as any).userId);
    }
    @Get('is-recruiter/:companyId')
    async isRecruiter(@Param('companyId') companyId: string, @Req() req: Request) {
        return await this.companyService.isRecruiter(companyId, (req as any).userId);
    }
}
