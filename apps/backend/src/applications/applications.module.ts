import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { GeminiProvider } from './gemini.provider';
import { UserDetailsService } from 'src/user-details/user-details.service';

@Module({
  imports: [DatabaseModule, UsersModule, ConfigModule],
  providers: [ApplicationsService, GeminiProvider,UserDetailsService],
  controllers: [ApplicationsController],
  exports: [ApplicationsService]
})
export class ApplicationsModule {}
