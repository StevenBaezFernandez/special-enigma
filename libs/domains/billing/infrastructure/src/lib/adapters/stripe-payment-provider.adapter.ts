import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '../../../../domain/src/lib/ports/payment-provider.port';
import Stripe from 'stripe';

@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(StripePaymentProvider.name);
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_placeholder';
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-01-27.acacia', // Using latest known API version
    } as any);
  }

  async processPayment(amount: number, currency: string, source: string): Promise<{ success: boolean; transactionId: string }> {
    this.logger.log(`Processing payment via Stripe: ${amount} ${currency}`);

    try {
      const charge = await this.stripe.charges.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency: currency.toLowerCase(),
        source, // token from frontend
        description: 'Virteex ERP Payment',
      });

      this.logger.log(`Payment successful: ${charge.id}`);
      return { success: true, transactionId: charge.id };
    } catch (error: any) {
      this.logger.error('Stripe payment failed', error);
      // If we are in mock mode (no valid key), we might want to throw a specific error
      // But for "Commercial Readiness", failing is correct if credentials are bad.
      throw new Error(`Payment failed: ${error.message}`);
    }
  }
}
