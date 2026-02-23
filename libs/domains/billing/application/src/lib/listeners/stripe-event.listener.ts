import { Injectable, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';

export class InvoicePaidEvent {
  constructor(
    public readonly stripeSubscriptionId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly customerId: string
  ) {}
}

export interface StripeInvoiceSucceededPayload {
  subscription: string;
  amount_paid: number;
  currency: string;
  customer: string;
}

@Injectable()
export class StripeEventListener {
  private readonly logger = new Logger(StripeEventListener.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  @OnEvent('stripe.invoice.payment_succeeded')
  async handleInvoicePaymentSucceeded(payload: StripeInvoiceSucceededPayload) {
    this.logger.log(`Handling Stripe invoice payment succeeded for subscription: ${payload.subscription}`);

    // In a real scenario, this is where Billing would record the invoice.

    const invoicePaidEvent = new InvoicePaidEvent(
      payload.subscription,
      payload.amount_paid,
      payload.currency,
      payload.customer
    );

    // Emit domain event that other modules (like Subscription) can react to.
    await this.eventEmitter.emitAsync('billing.invoice.paid', invoicePaidEvent);
  }
}
