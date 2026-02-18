import { Injectable } from '@nestjs/common';
import { pipeline } from '@xenova/transformers';
@Injectable()
export class EmbedService {
  private embedder: any;
  private initialized = false;
  private async init() {
    if (!this.initialized) {
      this.embedder = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
      );
    }
    this.initialized = true;
  }
  async embed(text: string) {
    await this.init();
    const output = await this.embedder(text);
    const embeddingArray = Array.from(output.data);
    if (embeddingArray.length > 384) {
      const numTokens = embeddingArray.length / 384;
      const pooled = new Array(384).fill(0);
      for (let dim = 0; dim < 384; dim++) {
        let sum = 0;
        for (let token = 0; token < numTokens; token++) {
          sum += embeddingArray[token * 384 + dim] as number;
        }
        pooled[dim] = sum / numTokens;
      }
      return pooled;
    }
    return embeddingArray;
  }
}
