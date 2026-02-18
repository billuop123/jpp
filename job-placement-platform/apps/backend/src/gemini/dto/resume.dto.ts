import { IsNotEmpty, IsString } from "class-validator";

export class ResumeTextExtractionDto{
    @IsString()
    @IsNotEmpty()
    text:string;
}