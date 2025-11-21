import { Injectable } from '@nestjs/common';
import { EmbedService } from '../embed/embed.service';
import { QdrantService } from '../qdrant/qdrant.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly embedService: EmbedService,
    private readonly qdrantService: QdrantService,
  ) {}

  async search(query: string) {
    const queryEmbedding = (await this.embedService.embed(query)) as number[];
    const results = await this.qdrantService.search(queryEmbedding, 1000);
    const payload = {};

    results.forEach((r) => {
      if (!r) return;
      if (!r.payload) return;
      const title = r.payload.job_title as string;
      const score = r.score;

      if (!payload[title] || score > payload[title]) {
        payload[title] = score;
      }
    });

    return payload;
  }
  async searchJobs(query:string){
    const queryEmbedding = (await this.embedService.embed(query)) as number[];
    const results = await this.qdrantService.searchJobs(queryEmbedding, 5);
    return results;
  }
}
