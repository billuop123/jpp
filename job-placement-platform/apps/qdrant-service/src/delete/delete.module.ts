import { Module } from '@nestjs/common';
import { DeleteService } from './delete.service';
import { QdrantModule } from 'src/qdrant/qdrant.module';
import { InsertModule } from 'src/insert/insert.module';
import { DatabaseModule } from 'src/database/database.module';
import { DeleteController } from './delete.controller';

@Module({
  imports: [QdrantModule, InsertModule, DatabaseModule],
  providers: [DeleteService],
  controllers: [DeleteController],
})
export class DeleteModule {}
