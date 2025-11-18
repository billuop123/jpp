import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService,DatabaseService]
})
export class JobsModule {}
