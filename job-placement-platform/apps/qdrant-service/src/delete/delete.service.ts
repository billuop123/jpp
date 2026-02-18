import { Injectable } from '@nestjs/common';
import { QdrantService } from 'src/qdrant/qdrant.service';
import { InsertService } from 'src/insert/insert.service';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class DeleteService {
  constructor(
    private readonly qdrantService: QdrantService,
    private readonly insertService: InsertService,
    private readonly databaseService: DatabaseService,
  ) {}

  async deleteAllPoints() {
    await this.qdrantService.clearCollection();
  }

  /**
   * Re-sync all jobs from the SQL database into Qdrant using the same logic
   * as the standard insert flow.
   */
  async syncDbs() {
    const jobs = await this.databaseService.getAllJobs();

    for (const job of jobs) {
      await this.insertService.insert(job);
    }

    return { synced: jobs.length };
  }
}
