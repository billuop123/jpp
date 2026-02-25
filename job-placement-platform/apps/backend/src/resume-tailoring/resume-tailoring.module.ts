import { Module } from '@nestjs/common';
import { ResumeTailoringService } from './resume-tailoring.service';
import { ResumeTailoringController } from './resume-tailoring.controller';
import { DatabaseModule } from 'src/database/database.module';
import { GeminiModule } from 'src/gemini/gemini.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [DatabaseModule, GeminiModule,UsersModule],
  providers: [ResumeTailoringService ],
  controllers: [ResumeTailoringController],
})
export class ResumeTailoringModule {}
