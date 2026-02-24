import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private configService:ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => {
                  return request?.headers?.authorization; 
                },
              ]),
            ignoreExpiration:false,
            secretOrKey:configService.get<string>('JWT_SECRET')!
        })
    }
    async validate(payload){
        return {userId:payload.id,
            role:payload.role
        }
        
    }
}