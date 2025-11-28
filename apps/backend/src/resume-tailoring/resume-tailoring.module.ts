import { Module } from '@nestjs/common';
import { ResumeTailoringService } from './resume-tailoring.service';
import { ResumeTailoringController } from './resume-tailoring.controller';
import { DatabaseModule } from 'src/database/database.module';
import { OpenaiModule } from 'src/openai/openai.module';

@Module({
  imports: [DatabaseModule, OpenaiModule],
  providers: [ResumeTailoringService],
  controllers: [ResumeTailoringController],
})
export class ResumeTailoringModule {}
