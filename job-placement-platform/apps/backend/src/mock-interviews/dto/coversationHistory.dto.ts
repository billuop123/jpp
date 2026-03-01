import { IsString } from "class-validator";

export class ConversationHistoryDto{
    @IsString()
    conversationHistory:string
}