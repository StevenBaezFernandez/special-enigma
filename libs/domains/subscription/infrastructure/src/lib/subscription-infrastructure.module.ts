import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  Subscription,
  SubscriptionPlan,
  SUBSCRIPTION_REPOSITORY,
  SUBSCRIPTION_PLAN_REPOSITORY,
  SUBSCRIPTION_GATEWAY,
  SubscriptionDomainModule
} from '@virteex/subscription-domain';

import { MikroOrmSubscriptionRepository } from './repositories/mikro-orm-subscription.repository';
import { MikroOrmSubscriptionPlanRepository } from './repositories/mikro-orm-subscription-plan.repository';
import { StripeSubscriptionAdapter } from './adapters/stripe-subscription.adapter';

@Global()
@Module({
  imports: [
    SubscriptionDomainModule,
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
      provide: SUBSCRIPTION_GATEWAY,
      useClass: StripeSubscriptionAdapter
    }
  ],
  exports: [
    SUBSCRIPTION_REPOSITORY,
    SUBSCRIPTION_PLAN_REPOSITORY,
    SUBSCRIPTION_GATEWAY,
    MikroOrmModule
  ]
})
export class SubscriptionInfrastructureModule {}
