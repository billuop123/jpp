import { NestFactory } from '@nestjs/core';
import { QdrantModule } from './qdrant.module';

async function bootstrap() {
  const app = await NestFactory.create(QdrantModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
