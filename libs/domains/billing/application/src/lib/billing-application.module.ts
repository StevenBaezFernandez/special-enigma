import { Module } from '@nestjs/common';
import { CreateInvoiceUseCase } from './use-cases/create-invoice.use-case';
import { GetInvoicesUseCase } from './use-cases/get-invoices.use-case';
import { GetPaymentHistoryUseCase } from './use-cases/get-payment-history.use-case';
import { GetUsageUseCase } from './use-cases/get-usage.use-case';
import { AddPaymentMethodUseCase } from './use-cases/add-payment-method.use-case';
import { GetPaymentMethodUseCase } from './use-cases/get-payment-method.use-case';
import { ProcessPaymentUseCase } from './use-cases/process-payment.use-case';
import { StripeEventListener } from './listeners/stripe-event.listener';
import { BillingDomainModule } from '@virteex/billing-domain';
import { BillingInfrastructureModule } from '@virteex/billing-infrastructure';

@Module({
  imports: [BillingDomainModule, BillingInfrastructureModule],
  providers: [
    CreateInvoiceUseCase,
    GetInvoicesUseCase,
    GetPaymentHistoryUseCase,
    GetUsageUseCase,
    AddPaymentMethodUseCase,
    GetPaymentMethodUseCase,
    ProcessPaymentUseCase,
    StripeEventListener
  ],
  exports: [
    CreateInvoiceUseCase,
    GetInvoicesUseCase,
    GetPaymentHistoryUseCase,
    GetUsageUseCase,
    AddPaymentMethodUseCase,
    GetPaymentMethodUseCase,
    ProcessPaymentUseCase
  ]
})
export class BillingApplicationModule {}
