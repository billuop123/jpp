import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AdminService {
  constructor(
      private readonly databaseService: DatabaseService,
    ) {}
    async getUsers(page:number,limit:number){
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        const users=await this.databaseService.users.findMany({
            select:{
                id:true,
                email:true,
                name:true,
                createdAt:true,
                updatedAt:true,
                role:{
                    select:{
                        code:true,
                    }
                },
                isPremium:true,
            },
            orderBy:{
                createdAt:'desc',
            },
            take:limitNumber,
            skip:(pageNumber-1)*limitNumber,
        })
        return users;
    }
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
    async updateUserRole(userId:string,roleCode:string){
        const allowedRoles = ['RECRUITER','CANDIDATE'];
        if(!allowedRoles.includes(roleCode)){
            throw new NotFoundException('Invalid role');
        }
        const user=await this.databaseService.users.findUnique({
            where:{
                id:userId,
            },
            select:{
                id:true,
                email:true,
                role:{
                    select:{
                        code:true,
                    }
                }
            }
        })
        if(!user){
            throw new NotFoundException('User not found');
        }
        if(user.role?.code==='ADMIN'){
            throw new NotFoundException('Cannot change role of admin user');
        }
        const role=await this.databaseService.roles.findUnique({
            where:{
                code:roleCode,
            },
            select:{
                id:true,
            }
        })
        if(!role){
            throw new NotFoundException('Role not found');
        }
        const updatedUser=await this.databaseService.users.update({
            where:{
                id:userId,
            },
            data:{
                roleId:role.id,
            },
            select:{
                id:true,
                email:true,
                name:true,
                role:{
                    select:{
                        code:true,
                    }
                }
            }
        })
        return updatedUser;
    }
}
