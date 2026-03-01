  import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { createIntentDto } from './dto/create-intent.dto';
import { createCheckoutSession } from './dto/create-checkout.dto';
import { CustomerEmailDto } from './dto/customer-email.dto';

@Controller('stripe')
export class StripeController {
    constructor(private readonly stripeService:StripeService){}
    @Post('create-intent')
    async createIntent(@Body() body:createIntentDto){
      return await this.stripeService.createIntent(body.amount, body.currency, body.receipt_email);
    }
    @Post('create-checkout-session')
    async createCheckoutSession(
      @Body()
      body: createCheckoutSession,
    ) {
      return await this.stripeService.createCheckoutsession(
        body.planType,
        body.success_url,
        body.cancel_url,
        body.customer_email,
      );
    }
    @UseGuards(JwtAuthGuard)
    @Post('check-session')
    async checkSession(@Query('session_id') session_id:string,@Body() body: CustomerEmailDto){
      const {email}=body;
      return await this.stripeService.checkSession(session_id,email);
    }
}
