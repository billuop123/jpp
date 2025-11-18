import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';
@Injectable()
export class IsAdmin implements NestMiddleware {
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
    const role = decodedToken.role;
    if(role !== 'ADMIN'){
      throw new UnauthorizedException('Only admin can access this resource');
    }
    next();
    }catch(error){
      throw new UnauthorizedException('Invalid token');
    }

  }
}
export class IsRecruiter implements NestMiddleware {
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
    const role = decodedToken.role;
    if(role !== 'RECRUITER'){
      throw new UnauthorizedException('You are not authorized to access this resource(recruiter only)');
    }
    next();
    }catch(error){
      throw new UnauthorizedException('Invalid token');
    }

  }
}
export class IsCandidate implements NestMiddleware {
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
    const role = decodedToken.role;
    if(role !== 'CANDIDATE'){
      throw new UnauthorizedException('You are not authorized to access this resource(candidate only)');
    }
    next();
    }catch(error){
      throw new UnauthorizedException('Invalid token');
    }

  }
}


