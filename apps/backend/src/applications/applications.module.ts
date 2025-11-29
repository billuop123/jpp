import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { DatabaseService } from 'src/database/database.service';
import { UsersService } from 'src/users/users.service';

@Module({
  providers: [ApplicationsService,DatabaseService,UsersService],
  controllers: [ApplicationsController]
})
export class ApplicationsModule {}
