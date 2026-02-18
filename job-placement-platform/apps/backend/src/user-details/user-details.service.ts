import { BadRequestException, Injectable, NotFoundException, Req } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UserDetailsDto } from './dto/user-details.dto';
import { PDFParse } from 'pdf-parse';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class UserDetailsService {
    constructor(private readonly databaseService: DatabaseService,private readonly usersService: UsersService) {}
    async create(userDetails: UserDetailsDto,@Req() req: Request) {  
        const userId = (req as any).userId;
        await this.usersService.userExistsById(userId);
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
    async getDetails(userId:string){
        await this.usersService.userExistsById(userId);
        const userDetails = await this.databaseService.userDetails.findUnique({
            where: {
                userId: userId,
            },
            select:{
                resumeLink: true,
                experience: true,
                location: true,
                linkedin: true,
                portfolio: true,
                github: true,
                expectedSalary: true,
                availability: true,
                skills: true,
                finished: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });
        if(!userDetails){
            throw new NotFoundException('User details not found');
        }
        return userDetails;
    }
    async parsePdf(@Req()req:Request){
        const userId=(req as any).userId;
        await this.usersService.userExistsById(userId);
        const userDetails=await this.databaseService.userDetails.findUnique({
            where: {
                userId: userId,
            },
            select:{
                resumeLink: true,
            }
        });
        if(!userDetails){
            throw new NotFoundException('User details not found');
        }
        const resumeLink=userDetails.resumeLink;
        if(!resumeLink){
            throw new NotFoundException('Resume link not found');
        }
        const parser=new PDFParse({url:resumeLink});
        const result=(await parser.getText()).text
        return {
            text:result
        };
        
}   

    async updateDetails(userDetails:UserDetailsDto,@Req() req:Request){
        const userId=(req as any).userId;
        await this.usersService.userExistsById(userId);
        const existingUserDetails=await this.databaseService.userDetails.findUnique({
            where: {
                userId: userId,
            },
        });
        if(!existingUserDetails){
            throw new NotFoundException('User details not found');
        }
        return await this.databaseService.userDetails.update({
            where: {
                userId: userId,
            },
            data: {
                ...userDetails,
                finished: true,
            },
        });
    }
    async getResumeText(userId:string){
        await this.usersService.userExistsById(userId);
        const userDetails=await this.getDetails(userId);
        if(!userDetails.resumeLink){
            throw new NotFoundException('Resume link not found');
        }
        const parser=new PDFParse({url:userDetails.resumeLink});
        const result=(await parser.getText()).text
        return result;
    }
}
