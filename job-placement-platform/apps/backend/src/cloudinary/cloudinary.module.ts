import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryController } from './cloudinary.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[DatabaseModule,UsersModule],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
  controllers: [CloudinaryController],
})
export class CloudinaryModule {}
