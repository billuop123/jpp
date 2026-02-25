import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JobDto } from './dto/jobs.dto';
import { Prisma } from '@repo/db';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { CompanyService } from 'src/company/company.service';
import { EmbedService } from 'src/embed/embed.service';
@Injectable()
export class JobsService {
    constructor(
      private readonly databaseService:DatabaseService,
      private readonly usersService: UsersService,
      private readonly companyService: CompanyService,
      private readonly embedService: EmbedService,
    ){}
    async create(job:JobDto,req:Request,companyId:string): Promise<Prisma.jobsGetPayload<{}>>{
        const userId=req.userId;
        const date=new Date()
        if(!userId){
            throw new BadRequestException("User id not found")
        }
        await this.usersService.userExistsById(userId);
        if(job.deadline < date){
            throw new BadRequestException('Deadline must be in the future');
        }
        const company=await this.databaseService.companies.findUnique({
            where:{
                id:companyId,
            },
        });
        if(!company){
            throw new NotFoundException('Company not found');
        }
        if(!company.isVerified){
            throw new BadRequestException('Company is not verified, please wait for the admin to verify your company');
        }
        if(company.postlimit===0){
            throw new BadRequestException('You have reached the maximum number of jobs you can post');
        }
        const jobtype=await this.databaseService.jobtypes.findFirst({
            where:{
                name:job.jobtype,
            },
        });
        if(!jobtype){
            throw new NotFoundException('Job type not found');
        }


        const jobData: Prisma.jobsCreateInput = {
            title: job.title,
            description: job.description,
            location: job.location,
            isRemote: job.isRemote,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryCurrency: job.salaryCurrency,
            requirements: job.requirements,
            responsibilities: job.responsibilities,
            benefits: job.benefits,
            deadline: job.deadline,
            postedBy: userId,
            company: {
                connect: {
                    id: company.id,
                },
            },
            jobtype: {
                connect: {
                    id: jobtype.id,
                },
            },
        };
        const newJob=await this.databaseService.jobs.create({
            data:jobData,
        });
        await this.companyService.decrementPostlimit(companyId);
        const textToEmbed = [
          newJob.title,
          newJob.title,
          newJob.title,
          newJob.description || '',
          newJob.requirements || '',
          newJob.responsibilities || '',
        ].join(' ').trim();
        if (textToEmbed) {
          try {
            const embedding = await this.embedService.embed(textToEmbed);
            await this.databaseService.jobs.update({
              where: { id: newJob.id },
              data: { embedding } as any,
            });
          } catch (e) {
            throw new BadRequestException('Failed to embed job, please try again later');
          }
        }
        return newJob;
    }
    async getJobTypes(){
        const jobtypes=await this.databaseService.jobtypes.findMany({
            select:{
                id:true,
                name:true,
                description:true,
            }
        })
        return jobtypes;
    }
    private extractRoleKeywords(resumeText: string): string {
        const rolePatterns = [
            /(?:aspiring|seeking|experienced|senior|junior|mid-level)?\s*(full[- ]?stack|backend|frontend|software|web|mobile|devops|data|ml|ai|cloud|qa|test|security)\s*(?:developer|engineer|architect|designer|analyst|scientist|specialist)/gi,
            /(?:developer|engineer|architect|designer|analyst|scientist|specialist)\s*(?:intern|internship)/gi,
        ];
        const matches: string[] = [];
        for (const pattern of rolePatterns) {
            const found = resumeText.match(pattern);
            if (found) matches.push(...found);
        }
        return matches.slice(0, 3).join(' ');
    }
    async search(query: string) {
        if (!query) {
            throw new BadRequestException('Search query is required');
        }
        return await this.searchJobs(query);
    }
    async findAll(limit?: number, offset?: number) {
        return await this.databaseService.jobs.findMany({
            where: {
                isactive: true,
                deadline: {
                    gt: new Date(),
                },
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
        const roleKeywords = this.extractRoleKeywords(query);
        const enhancedQuery = roleKeywords ? `${roleKeywords} ${roleKeywords} ${roleKeywords} ${query}` : query;
        console.log('Enhanced query:', enhancedQuery.substring(0, 200));
        const queryEmbedding = await this.embedService.embed(enhancedQuery);
        console.log('Query embedding length:', queryEmbedding.length, 'First 5 values:', queryEmbedding.slice(0, 5));
        const jobsWithEmbedding = await (this.databaseService.jobs as any).findMany({
          where: {
            deadline: {
              gt: new Date(),
            },
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
            embedding: true,
          },
        });
        console.log('Total jobs fetched:', jobsWithEmbedding.length);
        console.log('Jobs with embeddings:', jobsWithEmbedding.filter((j: any) => Array.isArray(j.embedding) && j.embedding.length > 0).length);
        if (jobsWithEmbedding.length > 0) {
          const firstJob = jobsWithEmbedding[0];
          console.log('First job:', firstJob.title, 'Embedding length:', firstJob.embedding?.length, 'First 5:', firstJob.embedding?.slice(0, 5));
        }

        const cosine = (a: number[], b: number[]): number => {
          let dot = 0;
          let na = 0;
          let nb = 0;
          const len = Math.min(a.length, b.length);
          for (let i = 0; i < len; i++) {
            const va = a[i] || 0;
            const vb = b[i] || 0;
            dot += va * vb;
            na += va * va;
            nb += vb * vb;
          }
          if (!na || !nb) return 0;
          return dot / (Math.sqrt(na) * Math.sqrt(nb));
        };

        const scored = jobsWithEmbedding
          .filter((job: any) => Array.isArray(job.embedding))
          .map((job: any) => ({
            ...job,
            score: cosine(queryEmbedding, job.embedding as number[]),
          }))
          .sort((a: any, b: any) => {
            const scoreDiff = b.score - a.score;
            if (Math.abs(scoreDiff) < 0.0001) {
              const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              if (dateDiff === 0) {
                return a.id.localeCompare(b.id);
              }
              return dateDiff;
            }
            return scoreDiff;
          });
        const jobsInOrder = scored.map(
          ({ embedding, score, ...rest }: any) => ({ ...rest, _score: score }),
        );
        console.log('Top 5 jobs with scores:', jobsInOrder.slice(0, 5).map((j: any) => ({ title: j.title, score: j._score })));
        return { jobs: jobsInOrder.map(({ _score, ...rest }: any) => rest) };
    }
    async findOneJob(jobId:string){
        const job=await this.databaseService.jobs.findUnique({
            where:{
                id:jobId,

            },
            include:{
                company:true,
            }
        })
        if(!job){
            throw new NotFoundException('Job not found');
        }
        return job;
    }
    async applicationExists(jobId: {jobId:string},req:Request){
        const jobIdData=jobId?.jobId
        const userId= req.userId
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
            },
            select:{
                applicationstatus:{
                    select:{
                        name:true,
                    }
                },
                id:true,
            }
        })
        if(application?.applicationstatus?.name==='PENDING'){
            return {
                status: false,
                message: 'Application is pending review',
            }
        }
        return {
            status:true,
        }
    }
    async getTopViewedJobs()  {
    const jobs=await this.databaseService.jobs.findMany({
        where:{
            isactive:true,
            deadline: {
                gt: new Date(),
            },
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
    async regenerateEmbeddings() {
        const jobs = await this.databaseService.jobs.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                requirements: true,
                responsibilities: true,
            },
        });

        console.log(`Found ${jobs.length} jobs to process`);
        let updated = 0;
        let failed = 0;

        for (const job of jobs) {
            const textToEmbed = [
                job.title,
                job.title,
                job.title,
                job.description || '',
                job.requirements || '',
                job.responsibilities || '',
            ].join(' ').trim();

            if (textToEmbed) {
                try {
                    const embedding = await this.embedService.embed(textToEmbed);
                    await this.databaseService.jobs.update({
                        where: { id: job.id },
                        data: { embedding } as any,
                    });
                    console.log(`✓ Updated embedding for: ${job.title}`);
                    updated++;
                } catch (e) {
                    console.error(`✗ Failed to embed job ${job.id}:`, e);
                    failed++;
                }
            }
        }

        return {
            total: jobs.length,
            updated,
            failed,
            message: `Regenerated embeddings for ${updated} jobs, ${failed} failed`,
        };
    }   
    async getPendingRequests(jobId:string){
        const job=await this.databaseService.jobs.findUnique({
            where:{
                id:jobId,
            },
        })
        if(!job){
            throw new NotFoundException('Job not found');
        }
        const applicationRequests=await this.databaseService.applications.findMany({
            where:{
                jobId:jobId,
                applicationstatus:{
                    name:'PENDING',
                }
            },
            select:{
                id:true,
                jobId:true,
                userId:true,
                applicationstatusId:true,
                createdAt:true,
                coverletter:true,
                notes:true,
                user:{
                    select:{
                        name:true,
                        email:true,
                    }
                }
            }
        })
        if(!applicationRequests){
            throw new NotFoundException('Pending requests not found');
        }
        return applicationRequests;
    }
    async updateRequestStatus(applicationId:string){
        const application=await this.databaseService.applications.findUnique({
            where:{
                id:applicationId,
            },
        })
        if(!application){
            throw new NotFoundException('Application not found');
        }
        const grantedStatus=await this.databaseService.applicationstatus.findUnique({
            where:{
                name:'GRANTED'
            },
        })
        if(!grantedStatus){
            throw new NotFoundException('Granted status not found');
        }
        await this.databaseService.applications.update({
            where:{
                id:applicationId,
            },
            data:{
                applicationstatusId:grantedStatus.id,
            }
        })
        return {
            status:true
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
}

}
