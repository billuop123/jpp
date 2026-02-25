import { IsEmail, IsEnum, IsString } from "class-validator";
export enum Mode{
    TAILORING="TAILORING",
    MOCK="MOCK",
    FULL="FULL"
}
export class createCheckoutSession{
    @IsEnum(Mode)
    planType:'TAILORING'|'MOCK' | "FULL"
    
    @IsString()
    success_url:string

    @IsString()
    cancel_url:string

    @IsString()
    @IsEmail()
    customer_email:string
}