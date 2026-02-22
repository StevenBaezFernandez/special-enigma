import { Controller, Post, Headers, Req, BadRequestException, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SubscriptionRepository, SUBSCRIPTION_REPOSITORY,
  SubscriptionPlanRepository, SUBSCRIPTION_PLAN_REPOSITORY,
  Subscription, SubscriptionStatus
} from '@virteex/subscription-domain';
import Stripe from 'stripe';

@Controller('stripe/webhook')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  private stripe: Stripe;
  private endpointSecret: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(SUBSCRIPTION_PLAN_REPOSITORY)
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_placeholder';
    this.endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-01-27.acacia',
    } as any);
  }

  @Post()
  async handleWebhook(@Headers('stripe-signature') signature: string, @Req() req: any) {
    if (!signature || !this.endpointSecret) {
       this.logger.warn('Missing stripe signature or secret');
       // Don't throw if testing locally without webhook secret, just warn.
       // But for production, this should block.
    }

    let event: Stripe.Event;

    try {
      const payload = req.rawBody || req.body;

      if (req.rawBody && this.endpointSecret) {
          event = this.stripe.webhooks.constructEvent(req.rawBody, signature, this.endpointSecret);
      } else {
          // Fallback for local testing or if rawBody is missing
          if (!this.endpointSecret) {
             this.logger.warn('No webhook secret configured, skipping signature verification.');
          } else {
             this.logger.warn('Raw body not found, skipping signature verification (INSECURE).');
          }
          event = req.body as Stripe.Event;
      }
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (!event) {
        throw new BadRequestException('Invalid event');
    }

    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as any);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as any);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as any);
        break;
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as any);
        break;
      default:
        // this.logger.debug(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(session: any) {
    const tenantId = session.client_reference_id;
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

    if (!tenantId || !subscriptionId) {
        this.logger.warn(`Missing tenantId or subscriptionId in checkout session: ${session.id}`);
        return;
    }

    let subscription = await this.subscriptionRepository.findByStripeId(subscriptionId);
    if (!subscription) {
        subscription = await this.subscriptionRepository.findByTenantId(tenantId);

        if (subscription) {
             subscription.stripeSubscriptionId = subscriptionId;
             subscription.stripeCustomerId = customerId;
             subscription.status = SubscriptionStatus.ACTIVE;

             const planId = session.metadata?.planId;
             if (planId) {
                 const plan = await this.subscriptionPlanRepository.findById(planId);
                 if (plan) {
                     subscription.plan = plan;
                 }
             }
             await this.subscriptionRepository.save(subscription);
        } else {
             const planId = session.metadata?.planId;
             if (planId) {
                 const plan = await this.subscriptionPlanRepository.findById(planId);
                 if (plan) {
                     subscription = new Subscription(tenantId, plan, SubscriptionStatus.ACTIVE);
                     subscription.stripeSubscriptionId = subscriptionId;
                     subscription.stripeCustomerId = customerId;
                     await this.subscriptionRepository.save(subscription);
                 } else {
                     this.logger.error(`Plan not found: ${planId}`);
                 }
             } else {
                 this.logger.warn(`Missing planId in metadata for checkout session: ${session.id}`);
             }
        }
    }
  }

  private async handlePaymentSucceeded(invoice: any) {
    if (!invoice.subscription) return;
    const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;

    const subscription = await this.subscriptionRepository.findByStripeId(subId);
    if (subscription) {
      if (subscription.status !== SubscriptionStatus.ACTIVE) {
          subscription.status = SubscriptionStatus.ACTIVE;
          await this.subscriptionRepository.save(subscription);
      }
    }
  }

  private async handleSubscriptionUpdated(stripeSub: any) {
    const subscription = await this.subscriptionRepository.findByStripeId(stripeSub.id);
    if (subscription) {
      const statusMap: Record<string, SubscriptionStatus> = {
          'active': SubscriptionStatus.ACTIVE,
          'past_due': SubscriptionStatus.PAST_DUE,
          'canceled': SubscriptionStatus.CANCELED,
          'trialing': SubscriptionStatus.TRIAL,
          'unpaid': SubscriptionStatus.EXPIRED,
          'incomplete': SubscriptionStatus.TRIAL,
          'incomplete_expired': SubscriptionStatus.EXPIRED,
          'paused': SubscriptionStatus.ACTIVE
      };

      subscription.status = statusMap[stripeSub.status] || SubscriptionStatus.ACTIVE;
      subscription.currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
      subscription.endDate = subscription.currentPeriodEnd;
      subscription.cancelAtPeriodEnd = stripeSub.cancel_at_period_end;

      await this.subscriptionRepository.save(subscription);
    }
  }

  private async handleSubscriptionDeleted(stripeSub: any) {
    const subscription = await this.subscriptionRepository.findByStripeId(stripeSub.id);
    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.endDate = new Date(); // End now
      await this.subscriptionRepository.save(subscription);
    }
  }
}
