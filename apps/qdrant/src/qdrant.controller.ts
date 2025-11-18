import { Controller, Get } from '@nestjs/common';
import { QdrantService } from './qdrant.service';

@Controller()
export class QdrantController {
  constructor(private readonly qdrantService: QdrantService) {}

  @Get()
  getHello(): string {
    return this.qdrantService.getHello();
  }
}
