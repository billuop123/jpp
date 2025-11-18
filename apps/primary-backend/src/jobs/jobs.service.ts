import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JobDto } from './dto/jobs.dto';
import { Prisma } from '@repo/db';
import { Request } from 'express';

@Injectable()
export class JobsService {
    constructor(private readonly databaseService:DatabaseService){}
    async create(job:JobDto,req:Request): Promise<Prisma.jobsGetPayload<{}>>{
        const userId=(req as any).userId;
        const date=new Date()
        if(job.deadline < date){
            throw new BadRequestException('Deadline must be in the future');
        }
        const jobtype=await this.databaseService.jobtypes.findFirst({
            where:{
                name:job.jobtype,
            },
        });
        if(!jobtype){
            throw new NotFoundException('Job type not found');
        }
        const company=await this.databaseService.companies.findUnique({
            where:{
                id:job.companyId,
            },
        });
        if(!company){
            throw new NotFoundException('Company not found');
        }
        const jobData: Prisma.jobsCreateInput = {
            title:job.title,
            description:job.description,
            location:job.location,
            isRemote:job.isRemote,
            salaryMin:job.salaryMin,
            salaryMax:job.salaryMax,
            salaryCurrency:job.salaryCurrency,
            requirements:job.requirements,
            responsibilities:job.responsibilities,
            benefits:job.benefits,
            deadline:job.deadline,
            company:{
                connect:{
                    id:company.id,
                },
            },
            jobtype:{
                connect:{
                    id:jobtype.id,
                },
            },
            postedBy:userId,
        };
        const newJob=await this.databaseService.jobs.create({
            data:jobData,
        });
        return newJob;
    }
}
