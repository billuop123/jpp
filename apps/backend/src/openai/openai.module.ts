import { Module } from '@nestjs/common';
import { OpenaiController } from './openai.controller';
import { OpenaiService } from './openai.service';
import { OpenaiProvider } from './openai.provider';

@Module({
  controllers: [OpenaiController],
  providers: [OpenaiService, OpenaiProvider],
  exports: [OpenaiService],
})
export class OpenaiModule {}
