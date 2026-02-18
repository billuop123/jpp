import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe:Stripe | null = null;
    constructor(private readonly databaseService:DatabaseService,configService:ConfigService){
        const stripeSecretKey = configService.get<string>('STRIPE_SECRET_KEY');
        this.stripe = stripeSecretKey? new Stripe(stripeSecretKey, { apiVersion: "2025-11-17.clover" }): null;
        if(!this.stripe){
            throw new InternalServerErrorException('Stripe secret key is not configured');
        }
    }
    async createIntent(amount:number,currency="usd",receipt_email:string){
        if(!amount || typeof amount !=='number'){
            throw new BadRequestException('Amount (number, in smallest currency unit) required');
        }
        if(!this.stripe){
            throw new InternalServerErrorException('Stripe is not configured');
        }

    const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        receipt_email: receipt_email,
        automatic_payment_methods: { enabled: true },
      });
  
      return { mock: false };
    }
    async createCheckoutsession(
      planType: 'TAILORING' | 'MOCK' | 'FULL',
      success_url: string,
      cancel_url: string,
      customer_email: string,
    ){
        if(!this.stripe){
            throw new InternalServerErrorException('Stripe is not configured');
        }
        let amount = 0;
        let productName = '';

        switch (planType) {
          case 'TAILORING':
            amount = 500; // $5.00
            productName = 'Tailored Resume Access';
            break;
          case 'MOCK':
            amount = 500; // $5.00
            productName = 'Mock Interviews Access';
            break;
          case 'FULL':
          default:
            amount = 800; // $8.00 for full premium
            productName = 'Full Premium (Tailoring + Mock Interviews)';
            break;
        }

        const session=  await this.stripe?.checkout.sessions.create({
            line_items: [
              {
                price_data: {
                  currency: "usd",
                  product_data: { name: productName },
                  unit_amount: amount,
                },
                quantity: 1,
              },
            ],
            success_url:success_url+"?session_id={CHECKOUT_SESSION_ID}",
            cancel_url:cancel_url+"?session_id={CHECKOUT_SESSION_ID}",
            mode: "payment",
            customer_email,
            metadata: {
              planType,
            },
        });
        return {url:session?.url}
    }
    async checkSession(session_id:string,customer_email:string){
        const session=await this.stripe?.checkout.sessions.retrieve(session_id);
        if(session?.status==="complete" && customer_email){
          const planType = session?.metadata?.planType as
            | 'TAILORING'
            | 'MOCK'
            | 'FULL'
            | undefined;

          const data: any = {};
          if (planType === 'TAILORING') {
            data.isTailoringPremium = true;
          } else if (planType === 'MOCK') {
            data.isMockInterviewsPremium = true;
          } else {
            // FULL or unknown defaults to full premium
            data.isPremium = true;
            data.isTailoringPremium = true;
            data.isMockInterviewsPremium = true;
          }

          await this.databaseService.users.update({
              where: { email: customer_email },
              data,
          });
        }
        else{
            throw new BadRequestException('Payment is not complete');
        }
        return {success:session?.status==="complete",message:session?.status}
    }
}
