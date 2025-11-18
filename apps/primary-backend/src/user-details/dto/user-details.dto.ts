import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export class UserDetailsDto{

    
    @IsOptional()
    @IsInt()
    experience?: number;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    resumeLink?: string;


    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    linkedin?: string;

    @IsOptional()
    @IsString()
    portfolio?: string;

    @IsOptional()
    @IsString()
    @IsUrl()
    github?: string;

    @IsOptional()
    @IsInt()
    expectedSalary?: number;

    @IsOptional()
    @IsString()
    availability?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[];


}   