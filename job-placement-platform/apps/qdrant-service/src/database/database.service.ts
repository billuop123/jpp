import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// Use the shared Prisma client package, same as the main backend
// @ts-ignore PrismaClient is re-exported from @repo/db's generated client
import { PrismaClient } from '@repo/db';

@Injectable()
export class DatabaseService extends (PrismaClient as { new (): any }) implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async getAllJobs() {
    return this.jobs.findMany();
  }
}


