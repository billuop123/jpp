import { Module } from '@nestjs/common';
import { OpenaiController } from './openai.controller';
import { OpenaiService } from './openai.service';
import { OpenaiProvider } from './openai.provider';
import { ConfigModule } from 'src/config/config.module';

@Module({
  controllers: [OpenaiController],
  providers: [OpenaiService, OpenaiProvider]
})
export class OpenaiModule {}
