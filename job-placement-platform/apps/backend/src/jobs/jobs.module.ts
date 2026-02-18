import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { DatabaseModule } from 'src/database/database.module';
import { UsersService } from 'src/users/users.service';
import { CompanyService } from 'src/company/company.service';
import { EmbedService } from 'src/embed/embed.service';

@Module({
  imports:[DatabaseModule],
  controllers: [JobsController],
  providers: [JobsService,UsersService,CompanyService,EmbedService],
  exports: [JobsService]
})
export class JobsModule {}
