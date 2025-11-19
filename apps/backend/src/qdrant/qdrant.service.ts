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
}

