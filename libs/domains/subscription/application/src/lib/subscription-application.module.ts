import { Module } from '@nestjs/common';
import { CreateSubscriptionUseCase } from './use-cases/create-subscription.use-case';
import { GetSubscriptionPlansUseCase } from './use-cases/get-subscription-plans.use-case';
import { GetSubscriptionUseCase } from './use-cases/get-subscription.use-case';
import { SubscriptionDomainModule } from '@virteex/subscription-domain';

@Module({
  imports: [SubscriptionDomainModule],
  providers: [
    CreateSubscriptionUseCase,
    GetSubscriptionPlansUseCase,
    GetSubscriptionUseCase
  ],
  exports: [
    CreateSubscriptionUseCase,
    GetSubscriptionPlansUseCase,
    GetSubscriptionUseCase
  ]
})
export class SubscriptionApplicationModule {}
