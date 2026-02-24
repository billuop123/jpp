import { Inject, Injectable } from '@nestjs/common';
import { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class EmailService {
  constructor(
    @Inject('EMAIL_TRANSPORTER') private transporter: Transporter,
  ) {}

  async sendEmail(options: EmailOptions) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }
}
