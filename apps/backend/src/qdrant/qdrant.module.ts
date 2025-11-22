import { Module } from '@nestjs/common';
import { QdrantService } from './qdrant.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'QDRANT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3002,
        },
      },
    ]),
  ],
  providers: [QdrantService],
  exports: [QdrantService],
})
export class QdrantModule {}
