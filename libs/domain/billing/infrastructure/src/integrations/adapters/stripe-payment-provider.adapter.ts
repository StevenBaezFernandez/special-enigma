import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type PaymentProvider } from '@virteex/domain-billing-domain';
import Stripe from 'stripe';

@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(StripePaymentProvider.name);
  private readonly nodeEnv: string;
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'development';
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is required to initialize StripePaymentProvider.');
    }

    if (this.nodeEnv === 'production' && secretKey.startsWith('sk_test_')) {
      throw new Error('Production environment cannot use Stripe test keys.');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-01-27.acacia',
    } as any);
  }

  async processPayment(amount: number, currency: string, source: string): Promise<{ success: boolean; transactionId: string }> {
    this.logger.log(`Processing payment via Stripe: ${amount} ${currency}`);

    try {
      const charge = await this.stripe.charges.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        source,
        description: 'Virteex ERP Payment',
      });

      this.logger.log(`Payment successful: ${charge.id}`);
      return { success: true, transactionId: charge.id };
    } catch (error  : any) {
      this.logger.error('Stripe payment failed', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  async createCheckoutSession(planId: string, tenantId: string): Promise<{ url: string }> {
    this.logger.log(`Creating Stripe checkout session for plan ${planId} and tenant ${tenantId}`);

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: planId, // In real scenario, planId might be the Stripe Price ID
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${this.configService.get('APP_URL')}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.configService.get('APP_URL')}/billing/cancel`,
        metadata: {
            tenantId,
            planId
        }
      });

      if (!session.url) {
        throw new Error('Stripe failed to generate a checkout URL');
      }

      return { url: session.url };
    } catch (error: any) {
      this.logger.error('Failed to create Stripe checkout session', error);
      throw new Error(`Checkout session creation failed: ${error.message}`);
    }
  }
}
