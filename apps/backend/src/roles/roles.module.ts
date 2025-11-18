import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService,DatabaseService]
})
export class RolesModule {}
