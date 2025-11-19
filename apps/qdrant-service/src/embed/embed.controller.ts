import { Body, Controller, Post } from '@nestjs/common';
import { EmbedService } from './embed.service';

@Controller('embed')
export class EmbedController {
    constructor(private readonly embedService:EmbedService){}

    @Post('embed')
    async embed(@Body() text:string){
        return await this.embedService.embed(text)
    }
}
