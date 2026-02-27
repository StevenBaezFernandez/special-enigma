import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CustomerRegistryGateway,
  SubscriptionProviderGateway,
  SubscriptionProviderResult,
  PaymentSessionProvider
} from '@virteex/domain-subscription-domain';
import { resolveStripeSecretKey } from '@virteex/domain-subscription-domain';
import Stripe from 'stripe';
import { StripeMapper } from './stripe.mapper';

@Injectable()
export class StripeSubscriptionAdapter implements CustomerRegistryGateway, SubscriptionProviderGateway, PaymentSessionProvider {
  private readonly logger = new Logger(StripeSubscriptionAdapter.name);
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const secretKey = resolveStripeSecretKey(
      this.configService.get<string>('NODE_ENV'),
      this.configService.get<string>('STRIPE_SECRET_KEY')
    );
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-01-27.acacia',
    } as any);
  }

  async createCustomer(email: string, name: string, paymentMethodId: string): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      return customer.id;
    } catch (error: any) {
      this.logger.error('Failed to create Stripe customer', error);
      throw new Error(`Stripe Customer Error: ${error.message}`);
    }
  }

  async createSubscription(customerId: string, priceId: string): Promise<SubscriptionProviderResult> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice.payment_intent as any;

      return {
        subscriptionId: subscription.id,
        customerId: customerId,
        clientSecret: paymentIntent?.client_secret || '',
        status: StripeMapper.toSubscriptionStatus(subscription.status),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      };
    } catch (error: any) {
       this.logger.error('Failed to create Stripe subscription', error);
       throw new Error(`Stripe Subscription Error: ${error.message}`);
    }
  }

  async updateSubscription(subscriptionId: string, priceId: string): Promise<SubscriptionProviderResult> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      const itemId = subscription.items.data[0].id;

      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: itemId,
          price: priceId,
        }],
        proration_behavior: 'always_invoice',
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      const invoice = updatedSubscription.latest_invoice as any;
      const paymentIntent = invoice?.payment_intent as any;

      return {
        subscriptionId: updatedSubscription.id,
        customerId: updatedSubscription.customer as string,
        clientSecret: paymentIntent?.client_secret || '',
        status: StripeMapper.toSubscriptionStatus(updatedSubscription.status),
        currentPeriodEnd: new Date((updatedSubscription as any).current_period_end * 1000),
      };
    } catch (error: any) {
      this.logger.error('Failed to update Stripe subscription', error);
      throw new Error(`Stripe Update Error: ${error.message}`);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.stripe.subscriptions.cancel(subscriptionId);
    } catch (error: any) {
      this.logger.error(`Failed to cancel subscription ${subscriptionId}`, error);
      throw error;
    }
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<string> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return session.url;
    } catch (error: any) {
       this.logger.error('Failed to create portal session', error);
       throw error;
    }
  }

  async createCheckoutSession(
    priceId: string,
    customerId: string,
    successUrl: string,
    cancelUrl: string,
    clientReferenceId?: string,
    metadata?: Record<string, string>
  ): Promise<string> {
     try {
       const session = await this.stripe.checkout.sessions.create({
         mode: 'subscription',
         payment_method_types: ['card'],
         customer: customerId,
         client_reference_id: clientReferenceId,
         metadata: metadata,
         subscription_data: {
            metadata: metadata,
         },
         line_items: [
           {
             price: priceId,
             quantity: 1,
           },
         ],
         success_url: successUrl,
         cancel_url: cancelUrl,
       });
       return session.url || '';
     } catch (error: any) {
        this.logger.error('Failed to create checkout session', error);
        throw error;
     }
  }
}
