import { IsOptional, IsString } from "class-validator";

export class CallAssistantDto{
    @IsOptional()
    assistant:any
  
    @IsString()
    jobId:string

    @IsOptional()
    mode:'real' | 'mock'
}