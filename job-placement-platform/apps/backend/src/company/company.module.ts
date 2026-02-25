import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [CloudinaryModule, DatabaseModule, UsersModule],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService]
})
export class CompanyModule {}
