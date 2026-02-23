import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { CustomerIdentityService } from './services/customer-identity.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Subscription, SubscriptionPlan])
  ],
  providers: [CustomerIdentityService],
  exports: [
    MikroOrmModule,
    CustomerIdentityService
  ]
})
export class SubscriptionDomainModule {}
