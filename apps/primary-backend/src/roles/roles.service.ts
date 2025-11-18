import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class RolesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    return this.databaseService.roles.findMany();
  }
}
