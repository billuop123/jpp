import { IsString, IsUUID } from "class-validator"

export class emailDto{
    @IsUUID()
    applicationId:string

    @IsString()
    to:string

    @IsString()
    candidateName:string

    @IsString()
    status:string

    @IsString()
    jobTitle:string

    @IsString()
    customMessage:string
}