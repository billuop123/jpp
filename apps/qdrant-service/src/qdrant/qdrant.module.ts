import { Body, Module, Post } from '@nestjs/common';
import { QdrantService } from './qdrant.service';

@Module({
  providers: [QdrantService],
})
export class QdrantModule {
  constructor(private readonly qdrantService: QdrantService) {}
  @Post('search')
  async search(@Body() vector: number[]) {
    return await this.qdrantService.search(vector);
  }

}
