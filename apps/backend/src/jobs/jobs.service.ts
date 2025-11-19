import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JobDto } from './dto/jobs.dto';
import { Prisma } from '@repo/db';
import { Request } from 'express';
import { QdrantService } from 'src/qdrant/qdrant.service';
import { json } from 'stream/consumers';

@Injectable()
export class JobsService {
    constructor(private readonly databaseService:DatabaseService, private readonly qdrantService: QdrantService){}
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
    async search(query: string) {
        if (!query) {
            throw new BadRequestException('Search query is required');
        }
        return await this.qdrantService.search(query);
    }
    async searchJobs(query:string){
        if(!query){
            throw new BadRequestException('Search query is required');
        }
        const results = JSON.stringify(await this.qdrantService.search(query))
        const jobs=JSON.parse(results)
        let relevantJobs:any=[]
        for (const job of Object.keys(jobs)){
            const jobData=await this.databaseService.jobs.findMany({
                where:{
                    title:job
                },
                take:5
            })
            relevantJobs.push(...jobData)
        }
        return relevantJobs;
    }
}
