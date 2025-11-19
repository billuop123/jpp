import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [ApplicationsService,DatabaseService],
  controllers: [ApplicationsController]
})
export class ApplicationsModule {}
