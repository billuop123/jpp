import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [LoggerService,DatabaseService],
  exports: [LoggerService]
})
export class LoggerModule {}
