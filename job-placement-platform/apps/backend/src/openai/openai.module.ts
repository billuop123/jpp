import { Module } from '@nestjs/common';
import { OpenaiController } from './openai.controller';
import { OpenaiService } from './openai.service';
import { OpenaiProvider } from './openai.provider';
import { UsersService } from 'src/users/users.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [OpenaiController],
  providers: [OpenaiService, OpenaiProvider,UsersService,DatabaseService],
  exports: [OpenaiService, OpenaiProvider],
})
export class OpenaiModule {}
