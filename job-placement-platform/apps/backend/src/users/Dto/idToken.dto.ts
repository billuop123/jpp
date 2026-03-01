import { IsOptional, IsString } from "class-validator";

export class IdTokenDto{
    @IsString()
    @IsOptional()
    idToken?:string
}   