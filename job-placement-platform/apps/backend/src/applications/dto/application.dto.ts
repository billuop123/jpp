import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class ApplicationDto{
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    jobId: string;
    
    @IsString()
    @IsNotEmpty()
    coverLetter:string


    @IsString()
    @IsOptional()
    notes:string

}