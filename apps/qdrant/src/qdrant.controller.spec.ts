import { Test, TestingModule } from '@nestjs/testing';
import { QdrantController } from './qdrant.controller';
import { QdrantService } from './qdrant.service';

describe('QdrantController', () => {
  let qdrantController: QdrantController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [QdrantController],
      providers: [QdrantService],
    }).compile();

    qdrantController = app.get<QdrantController>(QdrantController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(qdrantController.getHello()).toBe('Hello World!');
    });
  });
});
