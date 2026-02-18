import { Module } from '@nestjs/common';
import { ResumeTailoringService } from './resume-tailoring.service';
import { ResumeTailoringController } from './resume-tailoring.controller';
import { DatabaseModule } from 'src/database/database.module';
import { GeminiModule } from 'src/gemini/gemini.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [DatabaseModule, GeminiModule],
  providers: [ResumeTailoringService, UsersService],
  controllers: [ResumeTailoringController],
})
export class ResumeTailoringModule {}
