import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class CompanyDto{
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    @IsUrl()
    website: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    logo: string;

    @IsString()
    @IsNotEmpty()
    companyType:string

 




}