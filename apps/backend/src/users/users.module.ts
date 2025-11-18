import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService,LoggerService],
  imports: [DatabaseModule]
})
export class UsersModule {}
