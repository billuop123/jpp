import { Module } from '@nestjs/common';
import { InsertService } from './insert.service';
import { InsertController } from './insert.controller';
import { QdrantService } from 'src/qdrant/qdrant.service';
import { EmbedService } from 'src/embed/embed.service';

@Module({
  providers: [InsertService,QdrantService,EmbedService],
  controllers: [InsertController]
})
export class InsertModule {}
