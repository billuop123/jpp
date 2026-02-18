import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DeleteService } from './delete.service';

@Controller()
export class DeleteController {
  constructor(private readonly deleteService: DeleteService) {}

  @MessagePattern('clear-jobs')
  async clearJobs() {
    await this.deleteService.deleteAllPoints();
    return { status: 'ok' };
  }

  @MessagePattern('sync-jobs')
  async syncJobs() {
    return await this.deleteService.syncDbs();
  }
}


