import { BadRequestException, Body, Controller, Get, HttpCode, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserDto } from './Dto/create-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { Request } from 'express';
import { IdTokenDto } from './Dto/idToken.dto';
import { AccessTokenDto } from './Dto/accessToken.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async findAll() {
        return await this.usersService.findAll();
    }
    // @Post()
    // async create(@Body() user:UserDto) {
    //     return await this.usersService.create(user);
    // }
    // @Post('signin')
    // @HttpCode(200)
    // async signin(@Body() user:UserDto) {
    //     return await this.usersService.signin(user);
    // }
    @Post('google-auth')
    @HttpCode(200)
    async googleAuth(@Body() body: IdTokenDto) {
        const {idToken}=body;
        if(!idToken){
            throw new BadRequestException('ID token is required');
        }
        return await this.usersService.googleAuth(idToken);
    }
    @Post('github-auth')
    @HttpCode(200)
    async githubAuth(@Body() body: AccessTokenDto) {
        const {accessToken}=body;
        if(!accessToken){
            throw new BadRequestException('Access token is required');
        }
        return await this.usersService.githubAuth(accessToken);
    }
    @UseGuards(JwtAuthGuard)
    @Get('is-premium')
    @HttpCode(200)
    async isPremium(@Req() req: Request) {
        return await this.usersService.isPremium(req.userId as string);
    }
}