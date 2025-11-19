import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ApplicationDto{
    @IsString()
    @IsNotEmpty()
    jobId: string;
    
    @IsString()
    @IsNotEmpty()
    coverLetter:string


    @IsString()
    @IsOptional()
    notes:string

}