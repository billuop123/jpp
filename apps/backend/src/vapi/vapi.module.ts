import { Module } from '@nestjs/common';
import { VapiService } from './vapi.service';
import { VapiController } from './vapi.controller';
import { JobsModule } from 'src/jobs/jobs.module';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { UserDetailsModule } from 'src/user-details/user-details.module';

@Module({
  imports: [JobsModule, DatabaseModule, UsersModule, UserDetailsModule],
  providers: [VapiService],
  controllers: [VapiController]
})
export class VapiModule {}
