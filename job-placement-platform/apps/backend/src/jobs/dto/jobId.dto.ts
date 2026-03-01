import { IsUUID } from "class-validator";

export class jobIdDto{
    @IsUUID()
    jobId:string
}