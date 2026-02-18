import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MinLength } from "class-validator";
export class UserDto{
    @IsOptional()
    @IsString()
    @MinLength(3, { message: 'Name must be at least 3 characters long' })
    name?: string;

    @IsStrongPassword()
    @IsNotEmpty()
    password: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}