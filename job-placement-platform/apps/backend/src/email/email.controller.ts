import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-application-status')
  async sendApplicationStatus(
    @Body() body: { to: string; candidateName: string; status: 'approved' | 'rejected'; jobTitle: string; customMessage?: string },
  ) {
    const { to, candidateName, status, jobTitle, customMessage } = body;
    
    const subject = status === 'approved' 
      ? `Congratulations! Your application for ${jobTitle} has been approved`
      : `Update on your application for ${jobTitle}`;
    
    const text = customMessage || (status === 'approved'
      ? `Dear ${candidateName},\n\nWe are pleased to inform you that your application for the position of ${jobTitle} has been approved. Our team will contact you shortly with the next steps.\n\nBest regards,\nThe Recruitment Team`
      : `Dear ${candidateName},\n\nThank you for your interest in the position of ${jobTitle}. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\nWe appreciate the time you invested in the application process and wish you the best in your job search.\n\nBest regards,\nThe Recruitment Team`);

    return await this.emailService.sendEmail({ to, subject, text });
  }
}
