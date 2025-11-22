import { BadRequestException, Injectable, NotFoundException, Req } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UserDetailsDto } from './dto/user-details.dto';
import { PDFParse } from 'pdf-parse';

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
    async getDetails(userId:string){
        const userDetails = await this.databaseService.userDetails.findUnique({
            where: {
                userId: userId,
            },
        });
        if(!userDetails){
            throw new NotFoundException('User details not found');
        }
        return userDetails;
    }
    async parsePdf(@Req()req:Request){
        const userId=(req as any).userId;
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
}
