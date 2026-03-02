import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface StripeEvent {
  type: string;
  data: {
    object: any;
  };
}

@Injectable()
export class ProcessStripeWebhookUseCase {
  private readonly logger = new Logger(ProcessStripeWebhookUseCase.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async execute(event: StripeEvent): Promise<void> {
    this.logger.log(`Processing Stripe event: ${event.type}`);

    // Emit events based on type. Listeners in different modules can react.
    // Use a naming convention that modules can subscribe to.

    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.eventEmitter.emitAsync('stripe.invoice.payment_succeeded', event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.eventEmitter.emitAsync('stripe.invoice.payment_failed', event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.eventEmitter.emitAsync('stripe.subscription.deleted', event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.eventEmitter.emitAsync('stripe.subscription.updated', event.data.object);
        break;
      case 'checkout.session.completed':
        await this.eventEmitter.emitAsync('stripe.checkout.session.completed', event.data.object);
        break;
      case 'charge.dispute.created':
        await this.eventEmitter.emitAsync('stripe.charge.dispute.created', event.data.object);
        break;
      case 'charge.refunded':
        await this.eventEmitter.emitAsync('stripe.charge.refunded', event.data.object);
        break;
      case 'charge.dispute.closed':
        await this.eventEmitter.emitAsync('stripe.charge.dispute.closed', event.data.object);
        break;
      default:
        this.logger.debug(`Unhandled event type: ${event.type}`);
    }
  }
}
