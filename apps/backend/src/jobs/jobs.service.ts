import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JobDto } from './dto/jobs.dto';
import { Prisma } from '@repo/db';
import { Request } from 'express';
import { QdrantService } from 'src/qdrant/qdrant.service';
@Injectable()
export class JobsService {
    constructor(private readonly databaseService:DatabaseService,private readonly qdrantService: QdrantService){}
    async create(job:JobDto,req:Request,companyId:string): Promise<Prisma.jobsGetPayload<{}>>{
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
                id:companyId,
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
    async searchJobs(query: string) {
        if (!query) {
            throw new BadRequestException('Search query is required');
        }
        const jobs = await this.qdrantService.searchJobs(query);
        const orderedIds = jobs.map((job: any) => job.id);
        const jobsData = await this.databaseService.jobs.findMany({
            where: {
                id: { in: orderedIds },
            },
            select: {
                company: {
                    select: { name: true, logo: true }
                },
                jobtype: {
                    select: { name: true }
                },
                id: true,
                title: true,
                location: true,
                isRemote: true,
                isfeatured: true,
                createdAt: true,
                deadline:true,
                updatedAt: true,
                deletedAt: true,
            },
        });
        const jobsInOrder=orderedIds.map((id:string)=>{
            return jobsData.find((job:any)=>job.id===id)
        })
        return { jobs: jobsInOrder };
    }
    async findOneJob(jobId:string){
        const job=await this.databaseService.jobs.findUnique({
            where:{
                id:jobId,
            },
        })
        if(!job){
            throw new NotFoundException('Job not found');
        }
        return job;
    }
    async applicationExists(jobId: {jobId:string},req:Request){
        const jobIdData=jobId.jobId
        const userId=(req as any).userId
        const user=await this.databaseService.users.findUnique({
            where:{
                id:userId,
            },
        })
        if(!user){
            throw new UnauthorizedException('User not found');
        }
        const application=await this.databaseService.applications.findFirst({
            where:{
                jobId:jobIdData,
                userId:userId,
            }
        })
        return {
            status: application ? true : false,
            applicationId: application?.id || null
        }
    }
async getTopViewedJobs()  {
    const jobs=await this.databaseService.jobs.findMany({
        where:{
            isactive:true,
        },
        orderBy:{
            views:'desc',
        },
        take:5,
        select:{
            id:true,
            title:true,
            location:true,
            isRemote:true,
            isfeatured:true,
            deadline:true,
            createdAt:true,
            company:{
                select:{
                    name:true,
                    logo:true,
                }
            },
            jobtype:{
                select:{
                    name:true,
                }
            }
        }
    })
    return {
        jobs:jobs,
    }
}
async updateViews(jobId:string,req:any){
    const job=await this.databaseService.jobs.findUnique({
        where:{
            id:jobId,
        },
        select:{
                company:{
                    select:{
                        userId:true
                    }
                },
                views:true,
        }
    })
    if(job?.company?.userId==req.userId){
        return{
            status:true,
        }
    }
    if(!job){
        throw new NotFoundException('Job not found');
    }
    await this.databaseService.jobs.update({
        where:{
            id:jobId,
        },
        data:{
            views:job.views+1,
        },
    })
    return {
        status:true,
    }
}}
