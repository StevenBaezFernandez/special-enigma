import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { CustomerManagementService } from './services/customer-management.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Subscription, SubscriptionPlan])
  ],
  providers: [CustomerManagementService],
  exports: [
    MikroOrmModule,
    CustomerManagementService
  ]
})
export class SubscriptionDomainModule {}
