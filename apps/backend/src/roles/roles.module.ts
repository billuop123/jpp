import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { DatabaseService } from 'src/database/database.service';
import { IsAdmin, IsRecruiter, IsCandidate } from './roles.middleware';

@Module({
  controllers: [RolesController],
  providers: [RolesService, DatabaseService, IsAdmin, IsRecruiter, IsCandidate]
})
export class RolesModule {}
