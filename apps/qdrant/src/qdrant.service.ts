import { Injectable } from '@nestjs/common';

@Injectable()
export class QdrantService {
  getHello(): string {
    return 'Hello World!';
  }
}
