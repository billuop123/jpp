import { Body, Controller, Post, Req } from '@nestjs/common';

import { UserDetailsDto } from './dto/user-details.dto';
import { UserDetailsService } from './user-details.service';
import type {  Request } from 'express';
@Controller('user-details')
export class UserDetailsController {
    constructor(private readonly userDetailsService: UserDetailsService) {}
    @Post()
    async create(
        @Body() userDetails: UserDetailsDto,
        @Req() req: Request
    ) {
        return await this.userDetailsService.create(userDetails,req as any);
    }
}
