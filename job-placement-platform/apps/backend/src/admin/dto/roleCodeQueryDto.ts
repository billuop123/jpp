import { IsString } from "class-validator";

export class roleCodeQueryDto{
    @IsString()
    roleCode:string
}