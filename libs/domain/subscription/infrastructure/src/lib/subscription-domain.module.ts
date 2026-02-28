import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Subscription, SubscriptionPlan, CustomerIdentityService } from '@virteex/domain-subscription-domain';

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
