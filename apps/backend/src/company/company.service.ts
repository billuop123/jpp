import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CompanyDto } from './dto/create-company.dto';
import { Request } from 'express';
import { Prisma } from '@repo/db';

@Injectable()
export class CompanyService {
    constructor(private readonly databaseService: DatabaseService) {}
    async create(company:CompanyDto,req:Request){
        const userId=(req as any).userId;
        const companytype=company.companyType;
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
    async getMyCompanies(req:Request){
        const userId=(req as any).userId;
        console.log(userId)
        const user=await this.databaseService.users.findUnique({
            where: {
                id: userId,
            },
        });
        if(!user){
            throw new NotFoundException('User not found');
        }
        const companies=await this.databaseService.companies.findMany({
            where: {
                userId: userId,
            },
        });
        return companies;
    }
}
