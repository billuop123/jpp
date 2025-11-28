import { BadRequestException, Body, Controller, Get, HttpCode, Post, Query, Req } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import { UserDto } from './Dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService,private readonly loggerService: LoggerService) {}

    @Get()
    async findAll() {
        return await this.usersService.findAll();
    }
    @Post()
    async create(@Body() user:UserDto) {
        return await this.usersService.create(user);
    }
    @Post('signin')
    @HttpCode(200)
    async signin(@Body() user:UserDto) {
        return await this.usersService.signin(user);
    }
    @Post('google-auth')
    @HttpCode(200)
    async googleAuth(@Body('idToken') idToken?: string) {
        if(!idToken){
            throw new BadRequestException('ID token is required');
        }
        return await this.usersService.googleAuth(idToken);
    }
    @Post('github-auth')
    @HttpCode(200)
    async githubAuth(@Body('accessToken') accessToken?: string) {
        if(!accessToken){
            throw new BadRequestException('Access token is required');
        }
        return await this.usersService.githubAuth(accessToken);
    }
    @Get('is-premium')
    @HttpCode(200)
    async isPremium(@Req() req: Request) {
        return await this.usersService.isPremium((req as any).userId as string);
    }
}