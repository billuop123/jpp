import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { EmailService } from './email.service';
import { DatabaseService } from 'src/database/database.service';
import { emailDto } from './dto/email-dto';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Post('send-application-status')
  async sendApplicationStatus(
    @Body() body: emailDto,
  ) {
    const { applicationId, to, candidateName, status, jobTitle, customMessage } = body;
    return await this.emailService.sendApplicationStatus(applicationId,to,candidateName,status,jobTitle,customMessage)
  }
}
