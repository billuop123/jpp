import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from 'src/users/users.module';
import { CompanyModule } from 'src/company/company.module';
import { EmbedModule } from 'src/embed/embed.module';

@Module({
  imports: [DatabaseModule, UsersModule, CompanyModule, EmbedModule],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService]
})
export class JobsModule {}
