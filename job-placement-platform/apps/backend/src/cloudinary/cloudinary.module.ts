import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { DatabaseService } from 'src/database/database.service';
import { UsersService } from 'src/users/users.service';

@Module({
  providers: [CloudinaryProvider, CloudinaryService, DatabaseService, UsersService],
  exports: [CloudinaryProvider, CloudinaryService],
  controllers: [CloudinaryController],
})
export class CloudinaryModule {}
