import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { DatabaseModule } from 'src/database/database.module';
import { QdrantModule } from 'src/qdrant/qdrant.module';
import { UsersService } from 'src/users/users.service';
import { CompanyService } from 'src/company/company.service';

@Module({
  imports:[DatabaseModule,QdrantModule],
  controllers: [JobsController],
  providers: [JobsService,UsersService,CompanyService],
  exports: [JobsService]
})
export class JobsModule {}
