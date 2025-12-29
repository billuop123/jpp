import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
@Injectable()
export class QdrantService implements OnModuleInit {
  private client: QdrantClient;
  private readonly COLLECTION_NAME = 'added_jobs';
  private readonly VECTOR_SIZE = 384;
  constructor() {
    this.client = new QdrantClient({
      url: 'http://localhost:6333',
    });
  }

  async onModuleInit() {
    await this.ensureCollectionExists();
  }

  private async ensureCollectionExists() {
    try {
      const collection = await this.client.getCollection(this.COLLECTION_NAME);
      if (!collection) {
        await this.createCollection();
      }
    } catch (error: any) {
      if (error.status === 404 || error.message?.includes("doesn't exist")) {
        await this.createCollection();
      } else {
        throw error;
      }
    }
  }

  private async createCollection() {
    await this.client.createCollection(this.COLLECTION_NAME, {
      vectors: {
        size: this.VECTOR_SIZE,
        distance: 'Cosine',
      },
    });
  }

  async search(vector: number[], limit = 50) {
    await this.ensureCollectionExists();
    return await this.client.search('job_recommender', { vector, limit });
  }

  async upsertPoint(id: string, vector: number[], payload: any = {}) {
    await this.ensureCollectionExists();
    const pointId = typeof id === 'string' && id.startsWith('job_') 
      ? id 
      : id;
    
    return await this.client.upsert(this.COLLECTION_NAME, {
      points: [{ id: pointId, vector, payload }],
    });
  }
  async searchJobs(vector:number[],limit=1000){
    await this.ensureCollectionExists();
    return await this.client.search(this.COLLECTION_NAME, {
      vector: vector,
      limit: limit,
    });
  }

}
