import { Module } from '@nestjs/common';
import { CreateSubscriptionUseCase } from './use-cases/create-subscription.use-case';
import { GetSubscriptionPlansUseCase } from './use-cases/get-subscription-plans.use-case';
import { GetSubscriptionUseCase } from './use-cases/get-subscription.use-case';
import { CreateCheckoutSessionUseCase } from './use-cases/create-checkout-session.use-case';
import { CreatePortalSessionUseCase } from './use-cases/create-portal-session.use-case';
import { SubscriptionDomainModule } from '@virteex/subscription-domain';

@Module({
  imports: [SubscriptionDomainModule],
  providers: [
    CreateSubscriptionUseCase,
    GetSubscriptionPlansUseCase,
    GetSubscriptionUseCase,
    CreateCheckoutSessionUseCase,
    CreatePortalSessionUseCase
  ],
  exports: [
    CreateSubscriptionUseCase,
    GetSubscriptionPlansUseCase,
    GetSubscriptionUseCase,
    CreateCheckoutSessionUseCase,
    CreatePortalSessionUseCase
  ]
})
export class SubscriptionApplicationModule {}
