import { Module } from '@nestjs/common';
import { SubscribeToPlanUseCase } from './use-cases/subscribe-to-plan.use-case';
import { ChangeSubscriptionPlanUseCase } from './use-cases/change-subscription-plan.use-case';
import { ProcessStripeWebhookUseCase } from './use-cases/process-stripe-webhook.use-case';
import { GetSubscriptionPlansUseCase } from './use-cases/get-subscription-plans.use-case';
import { GetSubscriptionUseCase } from './use-cases/get-subscription.use-case';
import { CreateCheckoutSessionUseCase } from './use-cases/create-checkout-session.use-case';
import { CreatePortalSessionUseCase } from './use-cases/create-portal-session.use-case';
import { ProcessCheckoutSuccessUseCase } from './use-cases/process-checkout-success.use-case';
import { HandleInvoicePaidUseCase } from './use-cases/handle-invoice-paid.use-case';
import { HandleSubscriptionUpdatedUseCase } from './use-cases/handle-subscription-updated.use-case';
import { HandleSubscriptionDeletedUseCase } from './use-cases/handle-subscription-deleted.use-case';
import { SubscriptionDomainModule } from '@virteex/domain-subscription-infrastructure';

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
    ProcessCheckoutSuccessUseCase,
    HandleInvoicePaidUseCase,
    HandleSubscriptionUpdatedUseCase,
    HandleSubscriptionDeletedUseCase
  ],
  exports: [
    SubscribeToPlanUseCase,
    ChangeSubscriptionPlanUseCase,
    ProcessStripeWebhookUseCase,
    GetSubscriptionPlansUseCase,
    GetSubscriptionUseCase,
    CreateCheckoutSessionUseCase,
    CreatePortalSessionUseCase,
    ProcessCheckoutSuccessUseCase,
    HandleInvoicePaidUseCase,
    HandleSubscriptionUpdatedUseCase,
    HandleSubscriptionDeletedUseCase
  ]
})
export class SubscriptionApplicationModule {}
