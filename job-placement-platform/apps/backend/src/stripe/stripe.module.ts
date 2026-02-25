import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { DatabaseService } from 'src/database/database.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports:[DatabaseModule],
  controllers: [StripeController],
  providers: [StripeService,]
})
export class StripeModule {}
