import { IsArray, IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import {Type} from 'class-transformer';
export class JobDto{
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    description: string;

    @IsString()
    @IsNotEmpty()
    jobtype: string;

    @IsString()
    @IsOptional()
    location:string

    @IsBoolean()
    @IsOptional()
    isRemote:boolean

    @IsNumber()
    @IsOptional()
    salaryMin:number

    @IsNumber()
    @IsOptional()
    salaryMax:number

    @IsString()
    @IsOptional()
    salaryCurrency:string

    @IsString()
    @IsOptional()
    requirements:string

    @IsString()
    @IsOptional()
    responsibilities:string

    @IsString()
    @IsOptional()
    benefits:string

    @IsString()
    @IsOptional()
    applicationurl:string

    @IsString()
    @IsOptional()
    contactEmail:string

    @IsNumber()
    @IsOptional()
    experienceLevel:number

    @IsArray()
    @IsString({ each: true })
    skills:string[]

    @IsBoolean()
    @IsOptional()
    isactive:boolean

    @IsBoolean()
    @IsOptional()
    isfeatured:boolean

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    deadline:Date
}
export class SearchDto {
    @IsString()
    @IsNotEmpty()
    query: string;
}