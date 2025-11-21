import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { InsertService } from './insert.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('insert')
export class InsertController {
    constructor(private readonly insertService: InsertService) {}
    
    @MessagePattern('insert')
    async insert(@Body() data:any){
        return await this.insertService.insert(data);
    }   
}
