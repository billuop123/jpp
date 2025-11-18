import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const authorization = req.headers['authorization'];
    if(!authorization){
      throw new UnauthorizedException('Authorization header is required');
    }
    try{
    const decodedToken = jwt.verify(authorization, this.configService.get<string>('JWT_SECRET'));
    if(!decodedToken){
      throw new UnauthorizedException('Invalid token');
    }
    const userId = decodedToken.id;
    (req as any).userId = userId;
    const role = decodedToken.role;
    (req as any).role = role;
    next();
    }catch(error){
      throw new UnauthorizedException('Invalid token');
    }

  }
}
