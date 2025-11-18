import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
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
}