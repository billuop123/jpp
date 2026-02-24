import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailProvider } from './email.provider';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmailController],
  providers: [EmailService, EmailProvider],
  exports: [EmailService],
})
export class EmailModule {}
