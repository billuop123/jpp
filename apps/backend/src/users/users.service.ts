import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { UserDto } from './Dto/create-user.dto';
import {OAuth2Client} from 'google-auth-library';
import jwt from 'jsonwebtoken';
@Injectable()
export class UsersService {
    private readonly googleClientId: string;
    private readonly client: OAuth2Client;
    private readonly jwtSecret:string;
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
    ) {
        const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        if(!googleClientId){
            throw new InternalServerErrorException('Google Client ID is not configured');
        }
        this.googleClientId = googleClientId;
        this.client = new OAuth2Client(this.googleClientId);
        const jwtSecret = this.configService.get<string>('JWT_SECRET');
        if(!jwtSecret){
            throw new InternalServerErrorException('JWT secret is not configured');
        }
        this.jwtSecret = jwtSecret;
    }

    async findAll() {
        return await this.databaseService.users.findMany();
    }
    async create(user:UserDto){
        const candidateRole=await this.databaseService.roles.findUnique({
            where:{
                code:"CANDIDATE"
            }
        })      
        const existingUser=await this.databaseService.users.findUnique({
            where: {
                email: user.email,
            },
        });
        if(existingUser){
            throw new BadRequestException('User already exists');
        }
        return await this.databaseService.users.create({
            data: {
                ...user,
                roleId: candidateRole?.id,
            },
        });
    }
    async googleAuth(idToken:string){
        if(!idToken){
            throw new BadRequestException('ID token is required');
        }
        if(!this.googleClientId){
            throw new InternalServerErrorException('Google Client Id is not configured.')
        }
        const ticket=await this.client.verifyIdToken({
            idToken,
            audience: this.googleClientId
        })  
        const payload=ticket.getPayload();
        if(!payload){
            throw new UnauthorizedException('Invalid Id Token')
        }
        const {email,name}=payload;
        if(!email){
            throw new UnauthorizedException('Email is required')
        }
        const existingUser=await this.databaseService.users.findUnique({
            where: {
                email,
            },
        });
        if(existingUser){
            return existingUser;
        }
        // Generate a random password for OAuth users (they won't use it for login)
        const randomPassword = Math.random().toString(36).slice(-12) + Date.now().toString(36);
        return await this.databaseService.users.create({
            data: {
                email,
                name,
                password: randomPassword, // Required field, but OAuth users won't use password auth
            },
        });
    }
    async signin(user:UserDto){
        const validUser=await this.databaseService.users.findUnique({
            where: {
                email: user.email,
                password: user.password,
            },
            select:{
                email: true,
                id: true,
                role:{
                    select:{
                        code: true,
                    }
                }
            }
        });

        if(!validUser){
            throw new UnauthorizedException('Invalid credentials');
        }
        if(!validUser.role){
            throw new UnauthorizedException('User role is not assigned');
        }
        const token=jwt.sign({id: validUser.id,role: validUser.role.code}, this.jwtSecret, {expiresIn: '1h'});
        return {
            access_token: token,
            user: validUser,
        };
    }
}
