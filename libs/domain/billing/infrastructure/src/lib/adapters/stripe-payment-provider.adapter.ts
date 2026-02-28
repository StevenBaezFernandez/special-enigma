import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '../../../../domain/src/lib/ports/payment-provider.port';
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
    } catch (error: any) {
      this.logger.error('Stripe payment failed', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }
}
