import { BadRequestException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ApplicationDto } from './dto/application.dto';
import { Request } from 'express';

@Injectable()
export class ApplicationsService {
    private readonly logger = new Logger(ApplicationsService.name);
    
    constructor(private readonly databaseService:DatabaseService){}
    
    async create(application:ApplicationDto,req:Request){
        const userId = (req as any).userId;
        
        if(!userId){
            this.logger.error('User ID not found in request');
            throw new UnauthorizedException('User ID not found in token');
        }

        if(typeof userId !== 'string'){
            this.logger.error(`Invalid userId type: ${typeof userId}, value: ${userId}`);
            throw new BadRequestException('Invalid user ID format');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if(!uuidRegex.test(userId)){
            this.logger.error(`Invalid UUID format for userId: ${userId}`);
            throw new BadRequestException('Invalid user ID format');
        }

        if(!uuidRegex.test(application.jobId)){
            this.logger.error(`Invalid UUID format for jobId: ${application.jobId}`);
            throw new BadRequestException('Invalid job ID format');
        }

        const user = await this.databaseService.users.findUnique({
            where: {
                id: userId,
            },
        });

        if(!user){
            this.logger.error(`User not found with ID: ${userId}`);
            throw new BadRequestException('User not found');
        }

        const job=await this.databaseService.jobs.findUnique({
            where:{
                id:application.jobId,
            },
        })
        if(!job){
            this.logger.error(`Job not found with ID: ${application.jobId}`);
            throw new BadRequestException('Job not found');
        }
        
        const existingApplication=await this.databaseService.applications.findFirst({
            where:{
                jobId:application.jobId,
                userId:userId,
            }
        })

        if(existingApplication){
            throw new BadRequestException('Application already exists');
        }
        
        const applicationStatus=await this.databaseService.applicationstatus.findUnique({
            where:{
                code:'PENDING',
            },
            select:{
                id:true,
            },
        })
        if(!applicationStatus){
            throw new BadRequestException('Application status not found');
        }
        
        try {
            const newApplication=await this.databaseService.applications.create({
                data:{
                    jobId:application.jobId,
                    userId:userId,
                    coverletter:application.coverLetter,
                    notes:application.notes,
                    applicationstatusId:applicationStatus.id,
                }
            })
            return newApplication;
        } catch (error) {
            this.logger.error('Error creating application:', error);
            throw error;
        }
    }
}
