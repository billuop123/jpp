import { Module } from '@nestjs/common';
import { InsertService } from './insert.service';
import { InsertController } from './insert.controller';
import { QdrantModule } from 'src/qdrant/qdrant.module';
import { EmbedModule } from 'src/embed/embed.module';

@Module({
  imports: [QdrantModule, EmbedModule],
  providers: [InsertService],
  controllers: [InsertController],
  exports: [InsertService],
})
export class InsertModule {}
