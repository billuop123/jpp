import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [CloudinaryProvider, CloudinaryService,DatabaseService],
  exports: [CloudinaryProvider],
  controllers: [CloudinaryController]
})
export class CloudinaryModule {}
