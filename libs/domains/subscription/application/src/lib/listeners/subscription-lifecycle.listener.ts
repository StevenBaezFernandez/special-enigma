import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  Subscription,
  SubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
  SubscriptionPlanRepository,
  SUBSCRIPTION_PLAN_REPOSITORY,
  SubscriptionStatus
} from '@virteex/subscription-domain';

export interface InvoicePaidPayload {
  stripeSubscriptionId: string;
}

export interface StripeCheckoutSessionPayload {
  id: string;
  client_reference_id: string;
  subscription: string | { id: string };
  customer: string | { id: string };
  metadata?: Record<string, string>;
}

export interface StripeSubscriptionUpdatedPayload {
  id: string;
  status: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

@Injectable()
export class SubscriptionLifecycleListener {
  private readonly logger = new Logger(SubscriptionLifecycleListener.name);

  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(SUBSCRIPTION_PLAN_REPOSITORY)
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository
  ) {}

  @OnEvent('billing.invoice.paid')
  async handleInvoicePaid(payload: InvoicePaidPayload) {
    this.logger.log(`Reacting to invoice paid event for subscription: ${payload.stripeSubscriptionId}`);

    const subscription = await this.subscriptionRepository.findByStripeId(payload.stripeSubscriptionId);
    if (subscription) {
      if (subscription.status !== SubscriptionStatus.ACTIVE) {
          subscription.status = SubscriptionStatus.ACTIVE;
          await this.subscriptionRepository.save(subscription);
          this.logger.log(`Subscription ${subscription.id} status updated to ACTIVE`);
      }
    }
  }

  @OnEvent('stripe.checkout.session.completed')
  async handleCheckoutSessionCompleted(session: StripeCheckoutSessionPayload) {
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
                 }
             }
        }
    }
  }

  @OnEvent('stripe.subscription.updated')
  async handleStripeSubscriptionUpdated(stripeSub: StripeSubscriptionUpdatedPayload) {
    const subscription = await this.subscriptionRepository.findByStripeId(stripeSub.id);
    if (subscription) {
      const statusMap: Record<string, SubscriptionStatus> = {
          'active': SubscriptionStatus.ACTIVE,
          'past_due': SubscriptionStatus.PAST_DUE,
          'canceled': SubscriptionStatus.CANCELED,
          'trialing': SubscriptionStatus.TRIAL,
          'unpaid': SubscriptionStatus.EXPIRED,
          'incomplete': SubscriptionStatus.PAYMENT_PENDING,
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

  @OnEvent('stripe.subscription.deleted')
  async handleStripeSubscriptionDeleted(stripeSub: { id: string }) {
    const subscription = await this.subscriptionRepository.findByStripeId(stripeSub.id);
    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.endDate = new Date();
      await this.subscriptionRepository.save(subscription);
    }
  }
}
