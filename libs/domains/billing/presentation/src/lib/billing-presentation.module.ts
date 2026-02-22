import { Module } from '@nestjs/common';
import { BillingController } from './controllers/billing.controller';
import { PaymentMethodController } from './controllers/payment-method.controller';
import { PaymentController } from './controllers/payment.controller';
import {
  BillingApplicationModule
} from '../../../application/src/index';
import { BillingInfrastructureModule } from '../../../infrastructure/src/index';

@Module({
  imports: [BillingApplicationModule, BillingInfrastructureModule],
  controllers: [
    BillingController,
    PaymentMethodController,
    PaymentController
  ]
})
export class BillingPresentationModule {}
