import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { DatabaseService } from 'src/database/database.service';
import { UsersService } from 'src/users/users.service';

@Module({
  providers: [CompanyService,DatabaseService,UsersService],
  controllers: [CompanyController]
})
export class CompanyModule {}
