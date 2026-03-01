import { IsEmail } from "class-validator";

export class CustomerEmailDto{
    @IsEmail()
    email:string
}