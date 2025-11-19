import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ApplicationDto } from './dto/application.dto';
import { Request } from 'express';

@Injectable()
export class ApplicationsService {
    constructor(private readonly databaseService:DatabaseService){}
    async create(application:ApplicationDto,req:Request){
        const job=await this.databaseService.jobs.findUnique({
            where:{
                id:application.jobId,
            },
        })
        if(!job){
            throw new BadRequestException('Job not found');
        }
        const existingApplication=await this.databaseService.applications.findUnique({
            where:{
                jobId:application.jobId,
                userId:(req as any).userId,
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
        const newApplication=await this.databaseService.applications.create({
            data:{
                job:{
                    connect:{
                        id:application.jobId,
                    }
                },
                user:{
                    connect:{
          id:(req as any).userId as string,
                    },
                },
                coverletter:application.coverLetter,
                notes:application.notes,
                applicationstatus:{
                    connect:{
                        id:applicationStatus.id,
                    },
                },
            }
        })
        return newApplication;
    }
}
