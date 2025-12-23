import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiProvider } from './gemini.provider';
import { UsersService } from 'src/users/users.service';
import { DatabaseService } from 'src/database/database.service';
import { GeminiController } from './gemini.controller';

@Module({
  providers: [GeminiService, GeminiProvider, UsersService, DatabaseService],
  exports: [GeminiService, GeminiProvider],
  controllers: [GeminiController],
})
export class GeminiModule {}
