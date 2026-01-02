import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DatabaseService } from 'src/database/database.service';
import { QdrantModule } from 'src/qdrant/qdrant.module';

@Module({
  imports: [QdrantModule],
  controllers: [AdminController],
  providers: [AdminService, DatabaseService],
})
export class AdminModule {}
