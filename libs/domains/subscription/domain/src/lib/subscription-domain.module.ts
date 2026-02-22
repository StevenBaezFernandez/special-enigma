import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Subscription, SubscriptionPlan])
  ],
  exports: [
    MikroOrmModule
  ]
})
export class SubscriptionDomainModule {}
