import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  Subscription,
  SubscriptionPlan,
  SUBSCRIPTION_REPOSITORY,
  SUBSCRIPTION_PLAN_REPOSITORY,
  SubscriptionDomainModule
} from '@virteex/subscription-domain';

import { MikroOrmSubscriptionRepository } from './repositories/mikro-orm-subscription.repository';
import { MikroOrmSubscriptionPlanRepository } from './repositories/mikro-orm-subscription-plan.repository';

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
    }
  ],
  exports: [
    SUBSCRIPTION_REPOSITORY,
    SUBSCRIPTION_PLAN_REPOSITORY,
    MikroOrmModule
  ]
})
export class SubscriptionInfrastructureModule {}
