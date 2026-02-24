import { Module } from '@nestjs/common';
import { BillingController } from './controllers/billing.controller';
import { PaymentMethodController } from './controllers/payment-method.controller';
import { PaymentController } from './controllers/payment.controller';
import {
  BillingApplicationModule
} from '../../../application/src/index';
import { BillingInfrastructureModule } from '../../../infrastructure/src/index';
import { SubscriptionApplicationModule } from '@virteex/application-subscription-application';
import { SubscriptionInfrastructureModule } from '@virteex/infra-subscription-infrastructure';

@Module({
  imports: [
    BillingApplicationModule,
    BillingInfrastructureModule,
    SubscriptionApplicationModule,
    SubscriptionInfrastructureModule
  ],
  controllers: [
    BillingController,
    PaymentMethodController,
    PaymentController
  ]
})
export class BillingPresentationModule {}
