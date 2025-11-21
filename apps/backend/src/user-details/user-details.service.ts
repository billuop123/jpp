import { BadRequestException, Injectable, Req } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UserDetailsDto } from './dto/user-details.dto';

@Injectable()
export class UserDetailsService {
    constructor(private readonly databaseService: DatabaseService) {}
    async create(userDetails: UserDetailsDto,@Req() req: Request) {  
        const userId = (req as any).userId;
        const existingUserDetails = await this.databaseService.userDetails.findUnique({
            where: {
                userId: userId,
            },
        });
        if (existingUserDetails) {
            throw new BadRequestException('User details already exists');
        }
        return await this.databaseService.userDetails.create({
            data: {
                userId: userId,
                ...userDetails,
            },
            
        });
    }
}
