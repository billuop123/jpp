import { Module } from '@nestjs/common';
import { UserDetailsController } from './user-details.controller';
import { UserDetailsService } from './user-details.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [UserDetailsController],
  providers: [UserDetailsService,DatabaseService],
})
export class UserDetailsModule {}
