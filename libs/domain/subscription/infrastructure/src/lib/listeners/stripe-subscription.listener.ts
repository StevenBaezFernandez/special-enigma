import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ProcessCheckoutSuccessUseCase,
  HandleInvoicePaidUseCase,
  HandleSubscriptionUpdatedUseCase,
  HandleSubscriptionDeletedUseCase
} from '@virteex/domain-subscription-application';
import { StripeMapper } from '../adapters/stripe.mapper';

export interface InvoicePaidPayload {
  externalSubscriptionId: string;
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
export class StripeSubscriptionListener {
  private readonly logger = new Logger(StripeSubscriptionListener.name);

  constructor(
    private readonly processCheckoutSuccessUseCase: ProcessCheckoutSuccessUseCase,
    private readonly handleInvoicePaidUseCase: HandleInvoicePaidUseCase,
    private readonly handleSubscriptionUpdatedUseCase: HandleSubscriptionUpdatedUseCase,
    private readonly handleSubscriptionDeletedUseCase: HandleSubscriptionDeletedUseCase
  ) {}

  @OnEvent('billing.invoice.paid')
  async handleInvoicePaid(payload: InvoicePaidPayload) {
    this.logger.log(`Reacting to invoice paid event for subscription: ${payload.externalSubscriptionId}`);
    await this.handleInvoicePaidUseCase.execute({
      subscriptionId: payload.externalSubscriptionId
    });
  }

  @OnEvent('stripe.checkout.session.completed')
  async handleCheckoutSessionCompleted(session: StripeCheckoutSessionPayload) {
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

    if (!session.client_reference_id || !subscriptionId || !customerId) {
        this.logger.warn(`Missing data in checkout session: ${session.id}`);
        return;
    }

    await this.processCheckoutSuccessUseCase.execute({
      tenantId: session.client_reference_id,
      subscriptionId,
      customerId,
      planId: session.metadata?.planId
    });
  }

  @OnEvent('stripe.subscription.updated')
  async handleStripeSubscriptionUpdated(stripeSub: StripeSubscriptionUpdatedPayload) {
    await this.handleSubscriptionUpdatedUseCase.execute({
      subscriptionId: stripeSub.id,
      status: StripeMapper.toSubscriptionStatus(stripeSub.status),
      currentPeriodEnd: StripeMapper.toDomainDate(stripeSub.current_period_end),
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end
    });
  }

  @OnEvent('stripe.subscription.deleted')
  async handleStripeSubscriptionDeleted(stripeSub: { id: string }) {
    await this.handleSubscriptionDeletedUseCase.execute({
      subscriptionId: stripeSub.id
    });
  }
}
