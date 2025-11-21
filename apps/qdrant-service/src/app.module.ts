import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmbedModule } from './embed/embed.module';
import { QdrantModule } from './qdrant/qdrant.module';
import { SearchModule } from './search/search.module';
import { InsertModule } from './insert/insert.module';

@Module({
  imports: [EmbedModule, QdrantModule, SearchModule, InsertModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
