import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class HandleStripeWebhookUseCase {
  private readonly logger = new Logger(HandleStripeWebhookUseCase.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async execute(event: any) {
    this.logger.log(`Processing Stripe Webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        this.eventEmitter.emit('subscription.created', event.data.object);
        break;
      case 'invoice.paid':
        this.eventEmitter.emit('payment.succeeded', event.data.object);
        break;
      case 'invoice.payment_failed':
        this.eventEmitter.emit('payment.failed', event.data.object);
        break;
      case 'customer.subscription.deleted':
        this.eventEmitter.emit('subscription.cancelled', event.data.object);
        break;
      default:
        this.logger.debug(`Unhandled event type: ${event.type}`);
    }
    return { received: true };
  }
}
