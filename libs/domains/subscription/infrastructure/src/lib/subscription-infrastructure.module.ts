import { Module, Global, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  Subscription,
  SubscriptionPlan,
  SUBSCRIPTION_REPOSITORY,
  SUBSCRIPTION_PLAN_REPOSITORY,
  CUSTOMER_REGISTRY_GATEWAY,
  SUBSCRIPTION_PROVIDER_GATEWAY,
  PAYMENT_SESSION_PROVIDER
} from '@virteex/domain-subscription-domain';
import { SubscriptionDomainModule } from './subscription-domain.module';
import { SubscriptionApplicationModule } from '@virteex/application-subscription-application';

import { MikroOrmSubscriptionRepository } from './repositories/mikro-orm-subscription.repository';
import { MikroOrmSubscriptionPlanRepository } from './repositories/mikro-orm-subscription-plan.repository';
import { StripeSubscriptionAdapter } from './adapters/stripe-subscription.adapter';
import { StripeSubscriptionListener } from './listeners/stripe-subscription.listener';

@Global()
@Module({
  imports: [
    SubscriptionDomainModule,
    forwardRef(() => SubscriptionApplicationModule),
    MikroOrmModule.forFeature([
      Subscription,
      SubscriptionPlan
    ])
  ],
  providers: [
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: MikroOrmSubscriptionRepository
    },
    {
      provide: SUBSCRIPTION_PLAN_REPOSITORY,
      useClass: MikroOrmSubscriptionPlanRepository
    },
    {
      provide: CUSTOMER_REGISTRY_GATEWAY,
      useClass: StripeSubscriptionAdapter
    },
    {
      provide: SUBSCRIPTION_PROVIDER_GATEWAY,
      useClass: StripeSubscriptionAdapter
    },
    {
      provide: PAYMENT_SESSION_PROVIDER,
      useClass: StripeSubscriptionAdapter
    },
    StripeSubscriptionListener
  ],
  exports: [
    SUBSCRIPTION_REPOSITORY,
    SUBSCRIPTION_PLAN_REPOSITORY,
    CUSTOMER_REGISTRY_GATEWAY,
    SUBSCRIPTION_PROVIDER_GATEWAY,
    PAYMENT_SESSION_PROVIDER,
    MikroOrmModule
  ]
})
export class SubscriptionInfrastructureModule {}
