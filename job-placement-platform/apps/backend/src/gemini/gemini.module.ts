import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiProvider } from './gemini.provider';
import { GeminiController } from './gemini.controller';
import { UsersModule } from 'src/users/users.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports:[UsersModule,DatabaseModule],
  providers: [GeminiService, GeminiProvider],
  exports: [GeminiService, GeminiProvider],
  controllers: [GeminiController],
})
export class GeminiModule {}
