import { Injectable, OnModuleInit } from '@nestjs/common';
import {PrismaClient} from "@repo/db"
@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit{
    async onModuleInit() {  
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
}
