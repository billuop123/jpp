import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AdminService {
    constructor(private readonly databaseService: DatabaseService) {}
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
}
