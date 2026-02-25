import { IsEmail, IsNumber, IsString } from "class-validator";

export class createIntentDto{
    @IsNumber()
    amount:number

    @IsString()
    currency:string

    @IsEmail()
    receipt_email:string
    
}