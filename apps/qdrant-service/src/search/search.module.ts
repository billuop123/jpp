import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { QdrantService } from 'src/qdrant/qdrant.service';
import { EmbedService } from 'src/embed/embed.service';
import { SearchController } from './search.controller';

@Module({
  providers: [SearchService, QdrantService, EmbedService],
  controllers: [SearchController],
})
export class SearchModule {}
