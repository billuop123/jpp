import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { UserDetailsController } from './user-details.controller';
import { UserDetailsService } from './user-details.service';

@Module({
  imports:[UsersModule,DatabaseModule],
  controllers: [UserDetailsController],
  providers: [UserDetailsService],
  exports: [UserDetailsService]
})
export class UserDetailsModule {}
