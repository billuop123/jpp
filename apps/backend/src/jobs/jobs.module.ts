import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { DatabaseModule } from 'src/database/database.module';
import { QdrantModule } from 'src/qdrant/qdrant.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports:[DatabaseModule,QdrantModule],
  controllers: [JobsController],
  providers: [JobsService,UsersService]
})
export class JobsModule {}
