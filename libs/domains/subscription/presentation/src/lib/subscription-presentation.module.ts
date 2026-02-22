import { Module } from '@nestjs/common';
import { SubscriptionApplicationModule } from '@virteex/subscription-application';
import { SubscriptionController } from './controllers/subscription.controller';

@Module({
  imports: [SubscriptionApplicationModule],
  controllers: [SubscriptionController]
})
export class SubscriptionPresentationModule {}
