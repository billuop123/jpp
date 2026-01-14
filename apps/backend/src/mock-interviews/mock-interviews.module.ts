import { Module } from '@nestjs/common';
import { MockInterviewsService } from './mock-interviews.service';
import { MockInterviewsController } from './mock-interviews.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { UserDetailsModule } from 'src/user-details/user-details.module';
import { GeminiModule } from 'src/gemini/gemini.module';

@Module({
  imports: [DatabaseModule, UsersModule, JobsModule, UserDetailsModule, GeminiModule],
  providers: [MockInterviewsService],
  controllers: [MockInterviewsController],
})
export class MockInterviewsModule {}

