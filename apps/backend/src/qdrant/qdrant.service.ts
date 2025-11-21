import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class QdrantService {
  constructor(
    @Inject('QDRANT_SERVICE') private readonly client: ClientProxy,
  ) {}

  async search(query: string) {
    return await firstValueFrom(
      this.client.send('search', { query }),
    );
  }
  async insert(data:any){
    return await firstValueFrom(
      this.client.send('insert', { data }),
    );
  }
async searchJobs(query:string){
  return await firstValueFrom(
    this.client.send('search-jobs', { query }),
  );
}
}

