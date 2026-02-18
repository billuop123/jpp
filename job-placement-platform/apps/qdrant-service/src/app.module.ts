import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmbedModule } from './embed/embed.module';
import { QdrantModule } from './qdrant/qdrant.module';
import { SearchModule } from './search/search.module';
import { InsertModule } from './insert/insert.module';
import { DeleteModule } from './delete/delete.module';

@Module({
  imports: [
    // Load .env for this microservice, same pattern as the backend
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EmbedModule,
    QdrantModule,
    SearchModule,
    InsertModule,
    DeleteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
