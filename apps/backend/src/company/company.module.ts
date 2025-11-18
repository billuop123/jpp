import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [CompanyService,DatabaseService],
  controllers: [CompanyController]
})
export class CompanyModule {}
