import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CompanyDto } from './dto/create-company.dto';
import { Request } from 'express';
import { Prisma } from '@repo/db';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CompanyService {
    constructor(private readonly databaseService: DatabaseService,private readonly usersService: UsersService) {}
    async create(company:CompanyDto,req:Request){
        const userId=(req as any).userId;
        const companytype=company.companyType;
        await this.usersService.userExistsById(userId);
        const companyId=await this.databaseService.companyTypes.findFirst({
            where: {
                name: companytype,
            },
            select: {
                id: true,
            },
        });
        if(!companyId){
            throw new NotFoundException('Company type not found');
        }
        const existingCompany=await this.databaseService.companies.findUnique({
            where: {
                email: company.email,
            },
        });
        if(existingCompany){
            throw new BadRequestException('Company already exists with this email');
        }
        const newCompany=await this.databaseService.companies.create({
            data: {
                name: company.name,
                email: company.email,
                website: company.website,
                logo: company.logo,
                user: {
                    connect: {
                        id: userId,
                    },
                },
                companytype: {
                    connect: {
                        id: companyId.id,
                    },
                },
            } as Prisma.CompaniesCreateInput,
        });

        return newCompany;
    }
    async getCompanyTypes(){
        const companyTypes=await this.databaseService.companyTypes.findMany({
            select:{
                id:true,
                name:true,
                description:true,
            }
        })
        return companyTypes;
    }
    async getMyCompanies(req:Request){
        const userId=(req as any).userId;
        await this.usersService.userExistsById(userId);
        const companies=await this.databaseService.companies.findMany({
            where: {
                userId: userId,
            },
        });
        return companies;
    }
    async getCompanyJobs(companyId:string,req:Request){
        const company=await this.databaseService.companies.findUnique({
            where: {
                id: companyId,
            },
            select:{
                userId:true,
            },
        });
        if(!company){
            throw new NotFoundException('Company not found');
        }
        if(company.userId!==(req as any).userId){
            console.log(company.userId, (req as any).userId)
            throw new UnauthorizedException('You are not authorized to get this company jobs');
        }
        const jobs=await this.databaseService.jobs.findMany({
            where: {
                companyId: companyId,
            },
            select:{
                id:true,
            }
        });
        return jobs;
    }
    async getCompany(companyId:string,userId:string){
        const company=await this.databaseService.companies.findUnique({
            where:{
                id:companyId,
            },
            select:{
                name:true,
                email:true,
                website:true,
                logo:true,
                postlimit:true,
                companytype:true,
                blacklisted:true,
                userId:true,
                incorporationLink:true,
            }
        })

        if(!company){
            throw new NotFoundException('Company not found');
        }
        const isAssociated=company.userId===userId;
        return {
            ...company,
            isAssociated,
        }
    }
    async decrementPostlimit(companyId:string){
        const company=await this.databaseService.companies.findUnique({
            where:{
                id:companyId
            }
        })
        if(!company){
            throw new NotFoundException('Company not found');
        }
        await this.databaseService.companies.update({
            where:{
                id:companyId
            },
            data:{
                postlimit:company.postlimit-1
            }
        })
        return company;
    }
}
