import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
    constructor(private readonly stripeService:StripeService){}
    @Post('create-intent')
    async createIntent(@Body() body: { amount: number, currency: string, receipt_email: string }){
      return await this.stripeService.createIntent(body.amount, body.currency, body.receipt_email);
    }
    @Post('create-checkout-session')
    async createCheckoutSession(@Body() body: { line_items: any[], success_url: string, cancel_url: string, mode: string }) {
      return await this.stripeService.createCheckoutsession(body.line_items, body.success_url, body.cancel_url, body.mode);
    }
    @Post('check-session')
    async checkSession(@Query('session_id') session_id:string,@Body() body: { customer_email: string }){
      return await this.stripeService.checkSession(session_id,body.customer_email);
    }
}
