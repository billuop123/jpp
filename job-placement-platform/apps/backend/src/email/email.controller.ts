import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { EmailService } from './email.service';
import { DatabaseService } from 'src/database/database.service';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Post('send-application-status')
  async sendApplicationStatus(
    @Body() body: { 
      applicationId: string;
      to: string; 
      candidateName: string; 
      status: 'approved' | 'rejected'; 
      jobTitle: string; 
      customMessage?: string 
    },
  ) {
    const { applicationId, to, candidateName, status, jobTitle, customMessage } = body;
    console.log(applicationId,to,candidateName,status,jobTitle,customMessage)
    // Check if email already sent
    const application = await this.databaseService.applications.findUnique({
      where: { id: applicationId },
      select: { acceptanceEmailSent: true, rejectionEmailSent: true },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    if (status === 'approved' && application.acceptanceEmailSent) {
      throw new BadRequestException('Acceptance email already sent');
    }

    if (status === 'rejected' && application.rejectionEmailSent) {
      throw new BadRequestException('Rejection email already sent');
    }
    
    const subject = status === 'approved' 
      ? `Congratulations! Your application for ${jobTitle} has been approved`
      : `Update on your application for ${jobTitle}`;
    
    const text = customMessage || (status === 'approved'
      ? `Dear ${candidateName},\n\nWe are pleased to inform you that your application for the position of ${jobTitle} has been approved. Our team will contact you shortly with the next steps.\n\nBest regards,\nThe Recruitment Team`
      : `Dear ${candidateName},\n\nThank you for your interest in the position of ${jobTitle}. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\nWe appreciate the time you invested in the application process and wish you the best in your job search.\n\nBest regards,\nThe Recruitment Team`);

    // Send email
    const result = await this.emailService.sendEmail({ to, subject, text });

    // Update email sent flag
    await this.databaseService.applications.update({
      where: { id: applicationId },
      data: status === 'approved' 
        ? { acceptanceEmailSent: true }
        : { rejectionEmailSent: true },
    });

    return result;
  }
}
