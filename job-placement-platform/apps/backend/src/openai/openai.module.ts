import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { OpenaiController } from './openai.controller';
import { OpenaiProvider } from './openai.provider';
import { OpenaiService } from './openai.service';

@Module({
  imports:[UsersModule,DatabaseModule],
  controllers: [OpenaiController],
  providers: [OpenaiService, OpenaiProvider],
  exports: [OpenaiService, OpenaiProvider],
})
export class OpenaiModule {}
