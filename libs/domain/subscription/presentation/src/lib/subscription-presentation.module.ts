import { Module } from '@nestjs/common';
import { SubscriptionApplicationModule } from '@virteex/domain-subscription-application';
import { SubscriptionController } from './controllers/subscription.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';

@Module({
  imports: [SubscriptionApplicationModule],
  controllers: [
    SubscriptionController,
    StripeWebhookController
  ]
})
export class SubscriptionPresentationModule {}
