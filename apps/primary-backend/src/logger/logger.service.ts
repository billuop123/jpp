import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
  FATAL = 'fatal',
}

type logLevel = 'info' | 'warn' | 'error' | 'debug' | 'fatal';

@Injectable()
export class LoggerService extends Logger {
  constructor(private readonly databaseService: DatabaseService) {
    super();
  }
  async log(message: string, level: logLevel) {
    await this.databaseService.logs.create({
      data: {
        message,
        level,
      },
    });
  }
}
