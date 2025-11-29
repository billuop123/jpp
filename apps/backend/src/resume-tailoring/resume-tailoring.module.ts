import { Module } from '@nestjs/common';
import { ResumeTailoringService } from './resume-tailoring.service';
import { ResumeTailoringController } from './resume-tailoring.controller';
import { DatabaseModule } from 'src/database/database.module';
import { OpenaiModule } from 'src/openai/openai.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [DatabaseModule, OpenaiModule],
  providers: [ResumeTailoringService,UsersService],
  controllers: [ResumeTailoringController],
})
export class ResumeTailoringModule {}
