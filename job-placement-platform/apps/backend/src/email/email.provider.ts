import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

export const EmailProvider = {
  provide: 'EMAIL_TRANSPORTER',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return nodemailer.createTransport({
      host: configService.get('SMTP_HOST'),
    //   port: 465,
    //   secure: false,
      auth: {
        user: configService.get('SMTP_USER'),
        pass: configService.get('SMTP_PASSWORD'),
      },
    });
  },
};
