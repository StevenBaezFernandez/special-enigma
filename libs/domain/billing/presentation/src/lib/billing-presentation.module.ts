import { Module } from '@nestjs/common';
import { BillingController } from './controllers/billing.controller';
import { PaymentMethodController } from './controllers/payment-method.controller';
import { PaymentController } from './controllers/payment.controller';
import { BillingApplicationModule } from '@virteex/domain-billing-application';
import { SubscriptionApplicationModule } from '@virteex/domain-subscription-application';
import { SubscriptionInfrastructureModule } from '@virteex/domain-subscription-infrastructure';
import { BillingResolver } from './resolvers/billing.resolver';

@Module({
  imports: [
    BillingApplicationModule,
    SubscriptionApplicationModule,
    SubscriptionInfrastructureModule,
  ],
  controllers: [BillingController, PaymentMethodController, PaymentController],
  providers: [BillingResolver],
})
export class BillingPresentationModule {}
