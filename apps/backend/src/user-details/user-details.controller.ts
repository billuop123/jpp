import { Body, Controller, Get, Param, Post, Put, Req, UsePipes, ValidationPipe } from '@nestjs/common';

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
    @Get()
    async getDetails(@Req() req: Request) {
        return await this.userDetailsService.getDetails((req as any).userId as string);
    }
    @Get('parse-pdf')
    async parsePdf(@Req() req: Request) {
        return await this.userDetailsService.parsePdf(req as any);
    }
    @Put()
    async updateDetails(@Body() userDetails: UserDetailsDto, @Req() req: Request) {
        return await this.userDetailsService.updateDetails(userDetails,req as any);
    }
}
