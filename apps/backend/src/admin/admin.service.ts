import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { QdrantService } from 'src/qdrant/qdrant.service';

@Injectable()
export class AdminService {
    constructor(
      private readonly databaseService: DatabaseService,
      private readonly qdrantService: QdrantService,
    ) {}
    async getRecruiters(page:number,limit:number){
        const recruiters=await this.databaseService.users.findMany({
            where:{
                role:{
                    code:"RECRUITER"
                },
            },
            select:{    
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                company: {
                    select: {
                        name: true,
                    },
                },
                role:{
                    select:{
                        code: true,
                    }
                },
                isPremium:true
            },
            take:limit,
            skip:(page-1)*limit
        })
        return recruiters;
    }
    async getCandidates(page:number,limit:number){
        const candidates=await this.databaseService.users.findMany({
            where:{
                role:{
                    code:"CANDIDATE"
                }
            },
            select:{
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                role:{
                    select:{
                        code: true,
                    }
                },
                isPremium:true
            },
            take:limit,
            skip:(page-1)*limit
        })
        return candidates;
    }
    async getUnverifiedCompanies(page:number,limit:number){
        const unverifiedCompanies=await this.databaseService.companies.findMany({
            where:{
                isVerified:false,
                rejected:false,
            },
            take:limit,
            skip:(page-1)*limit
        })
        return unverifiedCompanies;
    }
    async verifyCompany(id:string){
        const company=await this.databaseService.companies.findUnique({
            where:{
                id:id
            }
        })
        if(!company){
            throw new NotFoundException('Company not found');
        }
        const companyUpdated=await this.databaseService.companies.update({
            where:{
                id:id
            },
            data:{
                isVerified:true
            }
        })
        return companyUpdated;
    }
    async rejectCompany(id:string){
        const company=await this.databaseService.companies.findUnique({
            where:{
                id:id
            }
        })
        if(!company){
            throw new NotFoundException('Company not found');
        }
        const companyUpdated=await this.databaseService.companies.update({
            where:{
                id:id
            },
            data:{
                rejected:true
            }
        })
        return companyUpdated;
    }
    async clearJobsFromBothDbs() {
        // Clear relational DB jobs
        await this.databaseService.jobs.deleteMany({});

        // Clear Qdrant collection
        await this.qdrantService.clearJobs();

        return { status: true };
    }

    async syncJobsToQdrant() {
        const result = await this.qdrantService.syncJobs();
        return { status: true, ...result };
    }
}
