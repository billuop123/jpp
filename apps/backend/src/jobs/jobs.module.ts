import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { DatabaseModule } from 'src/database/database.module';
import { QdrantModule } from 'src/qdrant/qdrant.module';

@Module({
  imports:[DatabaseModule,QdrantModule],
  controllers: [JobsController],
  providers: [JobsService]
})
export class JobsModule {}
