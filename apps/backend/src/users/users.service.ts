import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
    private readonly githubClientId: string;
    private readonly githubSecret: string;
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
    ) {
        const githubClientId = this.configService.get<string>('GITHUB_CLIENTID');
        if(!githubClientId){
            throw new InternalServerErrorException('GitHub Client ID is not configured');
        }
        const githubSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');
        if(!githubSecret){
            throw new InternalServerErrorException('GitHub Secret is not configured');
        }
        this.githubClientId = githubClientId;
        this.githubSecret = githubSecret;
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
        try{
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
                select:{
                    id: true,
                    email: true,
                    name: true,
                    role:{
                        select:{
                            code: true,
                        }
                    }
                }
            });
            if(existingUser){
                const token=jwt.sign({id: existingUser.id,role: existingUser.role?.code}, this.jwtSecret, {expiresIn: '1d'});
                return {
                    access_token: token,
                    user: existingUser,
                    role: existingUser.role?.code,
                };
            }
            const randomPassword = Math.random().toString(36).slice(-12) + Date.now().toString(36);
            const candidateRole=await this.databaseService.roles.findUnique({
                where:{
                    code:"CANDIDATE"
                }
            })
             const newUser= await this.databaseService.users.create({
                data: {
                    email,
                    name,
                    password: randomPassword,
                    role:{
                        connect:{
                            id: candidateRole?.id,
                        }
                    }
                },
                select:{
                    id: true,
                    email: true,
                    name: true,
                    role:{
                        select:{
                            code: true,
                        }
                    }
                },
            });
            const token=jwt.sign({id: newUser.id,role: newUser.role?.code}, this.jwtSecret, {expiresIn: '1d'});
            return {
                access_token: token,
                user: newUser,
                role: newUser.role?.code,
            };
        }catch(error){
            if(error instanceof HttpException){
                throw error;
            }
            throw new InternalServerErrorException('Failed to authenticate with Google');
        }
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
    async githubAuth(accessToken:string){
        if(!accessToken){
            throw new BadRequestException('Access token is required');
        }
        if(!this.githubClientId){
            throw new InternalServerErrorException('GitHub Client Id is not configured.');
        }
        const githubUser=await fetch('https://api.github.com/user',{
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data=await githubUser.json();
        if(!data){
            throw new UnauthorizedException('Invalid access token');
        }
        let {email,login:name}=data;
        if(!email){
            const emails = await fetch("https://api.github.com/user/emails", {
                headers: { Authorization: `Bearer ${accessToken}` },
              }).then((res) => res.json());
            const primary = emails.find((e) => e.primary && e.verified);
            email = primary.email;
        }
        const existingUser=await this.databaseService.users.findUnique({
            where: {
                email: email,
            },
            select:{
                id: true,
                email: true,
                name: true,
                role:{
                    select:{
                        code: true,
                    }
                }
            }
        });
        if(existingUser){
            const token=jwt.sign({id: existingUser.id,role: existingUser.role?.code}, this.jwtSecret, {expiresIn: '1h'});
            return {
                access_token: token,
                user: existingUser,
                role: existingUser.role?.code,
            };
        }
        const randomPassword = Math.random().toString(36).slice(-12) + Date.now().toString(36);
        const candidateRole=await this.databaseService.roles.findUnique({
            where:{
                code:"CANDIDATE"
            }
        })
        const newUser=await this.databaseService.users.create({
            data: {
                email: email,
                name: name,
                password: randomPassword,
                role:{
                    connect:{
                        id: candidateRole?.id,
                    }
                }
            },
            select:{
                id: true,
                email: true,
                name: true,
                role:{
                    select:{
                        code: true,
                    }
                }
            }
        });
        const token=jwt.sign({id: newUser.id,role: newUser.role?.code}, this.jwtSecret, {expiresIn: '1h'});
        return {
            access_token: token,
            user: newUser,
            role: newUser.role?.code,
        };
    }
    async isPremium(userId:string){

        const user=await this.databaseService.users.findUnique({
            where:{
                id:userId
            }
        })
        if(!user){
            throw new NotFoundException('User not found');
        }
        return {isPremium: user.isPremium};
    }
    async userExistsById(userId:string){
        const user=await this.databaseService.users.findUnique({
            where:{
                id:userId
            }
        })
        if(!user){
            throw new NotFoundException('User not found');
        }
        return user
    }
}
