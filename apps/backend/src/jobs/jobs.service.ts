import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JobDto } from './dto/jobs.dto';
import { Prisma } from '@repo/db';
import { Request } from 'express';
import { QdrantService } from 'src/qdrant/qdrant.service';
@Injectable()
export class JobsService {
    constructor(private readonly databaseService:DatabaseService,private readonly qdrantService: QdrantService){}
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
        const qdrantData = {
            id: newJob.id,
            title: newJob.title,
            description: newJob.description,
            requirements: newJob.requirements,
            responsibilities: newJob.responsibilities,
        };
        await this.qdrantService.insert(qdrantData);
        return newJob;
    }
    async search(query: string) {
        if (!query) {
            throw new BadRequestException('Search query is required');
        }
        return await this.qdrantService.search(query);
    }
    async findAll(limit?: number, offset?: number) {
        return await this.databaseService.jobs.findMany({
            where: {
                isactive: true,
            },
            take: limit || 50,
            skip: offset || 0,
            include: {
                company: true,
                jobtype: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async searchJobs(query:string){
        if(!query){
            throw new BadRequestException('Search query is required');
        }
        const results = JSON.stringify(await this.qdrantService.searchJobs(query))
        const jobs=JSON.parse(results)
        const jobIds=jobs.map((job:any)=>job.id)
        const jobsData=await this.databaseService.jobs.findMany({
            where:{
                id:{
                    in:jobIds,
                },
            },
            include:{
                company:true,
                jobtype:true,
            },
        })
        return jobsData
    }
}
