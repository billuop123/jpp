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
    async createCheckoutsession(line_items:any[],success_url:string,cancel_url:string,mode="payment"){
        if(!Array.isArray(line_items) || line_items.length === 0){
            throw new BadRequestException('Line items (array of objects) required');
        }
        if(!this.stripe){
            throw new InternalServerErrorException('Stripe is not configured');
        }
        const session=  await this.stripe?.checkout.sessions.create({
            line_items,
            success_url:success_url+"?session_id={CHECKOUT_SESSION_ID}",
            cancel_url:cancel_url+"?session_id={CHECKOUT_SESSION_ID}",
            mode: mode as any,
        });
        return {url:session?.url}
    }
    async checkSession(session_id:string,customer_email:string){
        const session=await this.stripe?.checkout.sessions.retrieve(session_id);
        if(session?.status==="complete" && customer_email){
            await this.databaseService.users.update({
                where: { email: customer_email },
                data: { isPremium: true },
            });
        }
        else{
            throw new BadRequestException('Payment is not complete');
        }
        return {success:session?.status==="complete",message:session?.status}
    }
}
