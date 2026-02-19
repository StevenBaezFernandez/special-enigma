import { Module } from '@nestjs/common';
import { CreateInvoiceUseCase } from './use-cases/create-invoice.use-case';
import { GetInvoicesUseCase } from './use-cases/get-invoices.use-case';
import { GetSubscriptionPlansUseCase } from './use-cases/get-subscription-plans.use-case';
import { GetPaymentHistoryUseCase } from './use-cases/get-payment-history.use-case';
import { GetUsageUseCase } from './use-cases/get-usage.use-case';
import { CreateSubscriptionUseCase } from './use-cases/create-subscription.use-case';
import { GetSubscriptionUseCase } from './use-cases/get-subscription.use-case';
import { AddPaymentMethodUseCase } from './use-cases/add-payment-method.use-case';
import { GetPaymentMethodUseCase } from './use-cases/get-payment-method.use-case';
import { ProcessPaymentUseCase } from './use-cases/process-payment.use-case';
import { BillingDomainModule } from '@virteex/billing-domain';
import { BillingInfrastructureModule } from '@virteex/billing-infrastructure';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [BillingDomainModule, forwardRef(() => BillingInfrastructureModule)],
  providers: [
    CreateInvoiceUseCase,
    GetInvoicesUseCase,
    GetSubscriptionPlansUseCase,
    GetPaymentHistoryUseCase,
    GetUsageUseCase,
    CreateSubscriptionUseCase,
    GetSubscriptionUseCase,
    AddPaymentMethodUseCase,
    GetPaymentMethodUseCase,
    ProcessPaymentUseCase
  ],
  exports: [
    CreateInvoiceUseCase,
    GetInvoicesUseCase,
    GetSubscriptionPlansUseCase,
    GetPaymentHistoryUseCase,
    GetUsageUseCase,
    CreateSubscriptionUseCase,
    GetSubscriptionUseCase,
    AddPaymentMethodUseCase,
    GetPaymentMethodUseCase,
    ProcessPaymentUseCase
  ]
})
export class BillingApplicationModule {}
