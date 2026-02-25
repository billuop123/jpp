import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { GeminiProvider } from '../gemini/gemini.provider';
import { UserDetailsService } from 'src/user-details/user-details.service';
import { GeminiModule } from 'src/gemini/gemini.module';
import { UserDetailsModule } from 'src/user-details/user-details.module';

@Module({
  imports: [DatabaseModule, UsersModule, ConfigModule,GeminiModule,UserDetailsModule],
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
  exports: [ApplicationsService]
})
export class ApplicationsModule {}
