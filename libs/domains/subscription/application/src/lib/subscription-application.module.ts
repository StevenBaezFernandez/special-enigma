import { Module } from '@nestjs/common';
import { SubscribeToPlanUseCase } from './use-cases/subscribe-to-plan.use-case';
import { ChangeSubscriptionPlanUseCase } from './use-cases/change-subscription-plan.use-case';
import { ProcessStripeWebhookUseCase } from './use-cases/process-stripe-webhook.use-case';
import { GetSubscriptionPlansUseCase } from './use-cases/get-subscription-plans.use-case';
import { GetSubscriptionUseCase } from './use-cases/get-subscription.use-case';
import { CreateCheckoutSessionUseCase } from './use-cases/create-checkout-session.use-case';
import { CreatePortalSessionUseCase } from './use-cases/create-portal-session.use-case';
import { SubscriptionLifecycleListener } from './listeners/subscription-lifecycle.listener';
import { SubscriptionDomainModule } from '@virteex/subscription-domain';

@Module({
  imports: [SubscriptionDomainModule],
  providers: [
    SubscribeToPlanUseCase,
    ChangeSubscriptionPlanUseCase,
    ProcessStripeWebhookUseCase,
    GetSubscriptionPlansUseCase,
    GetSubscriptionUseCase,
    CreateCheckoutSessionUseCase,
    CreatePortalSessionUseCase,
    SubscriptionLifecycleListener
  ],
  exports: [
    SubscribeToPlanUseCase,
    ChangeSubscriptionPlanUseCase,
    ProcessStripeWebhookUseCase,
    GetSubscriptionPlansUseCase,
    GetSubscriptionUseCase,
    CreateCheckoutSessionUseCase,
    CreatePortalSessionUseCase
  ]
})
export class SubscriptionApplicationModule {}
