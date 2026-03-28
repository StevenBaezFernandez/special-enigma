import { Module } from '@nestjs/common';
import { BillingController } from './http/controllers/billing.controller';
import { PaymentMethodController } from './http/controllers/payment-method.controller';
import { PaymentController } from './http/controllers/payment.controller';
import { BillingApplicationModule } from '@virteex/domain-billing-application';
import { SubscriptionApplicationModule } from '@virteex/domain-subscription-application';
import { BillingResolver } from './graphql/billing.resolver';

@Module({
  imports: [
    BillingApplicationModule,
    SubscriptionApplicationModule,
  ],
  controllers: [BillingController, PaymentMethodController, PaymentController],
  providers: [BillingResolver],
})
export class BillingPresentationModule {}
