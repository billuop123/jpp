import { IsOptional, IsString } from "class-validator";

export class AccessTokenDto{
    @IsString()
    @IsOptional()
    accessToken?:string
}