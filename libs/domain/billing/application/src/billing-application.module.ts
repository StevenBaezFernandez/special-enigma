import { Module } from '@nestjs/common';
import { CreateInvoiceUseCase } from './use-cases/commands/create-invoice.use-case';
import { GetInvoicesUseCase } from './use-cases/queries/get-invoices.use-case';
import { GetPaymentHistoryUseCase } from './use-cases/queries/get-payment-history.use-case';
import { GetUsageUseCase } from './use-cases/queries/get-usage.use-case';
import { AddPaymentMethodUseCase } from './use-cases/commands/add-payment-method.use-case';
import { GetPaymentMethodUseCase } from './use-cases/queries/get-payment-method.use-case';
import { ProcessPaymentUseCase } from './use-cases/commands/process-payment.use-case';
import { CreateCheckoutSessionUseCase } from './use-cases/commands/create-checkout-session.use-case';
import { ReconcileBillingUseCase } from './use-cases/commands/reconcile-billing.use-case';
import { StripeEventListener } from './handlers/stripe-event.listener';
import { BillingDomainModule } from '@virteex/domain-billing-domain';
import { PriceValidationPolicy } from './services/price-validation.policy';
import { InvoiceStampingOrchestrator } from './services/invoice-stamping.orchestrator';

@Module({
  imports: [BillingDomainModule],
  providers: [
    CreateInvoiceUseCase,
    GetInvoicesUseCase,
    GetPaymentHistoryUseCase,
    GetUsageUseCase,
    AddPaymentMethodUseCase,
    GetPaymentMethodUseCase,
    ProcessPaymentUseCase,
    CreateCheckoutSessionUseCase,
    ReconcileBillingUseCase,
    StripeEventListener,
    PriceValidationPolicy,
    InvoiceStampingOrchestrator,
  ],
  exports: [
    CreateInvoiceUseCase,
    GetInvoicesUseCase,
    GetPaymentHistoryUseCase,
    GetUsageUseCase,
    AddPaymentMethodUseCase,
    GetPaymentMethodUseCase,
    ProcessPaymentUseCase,
    CreateCheckoutSessionUseCase,
    ReconcileBillingUseCase,
  ]
})
export class BillingApplicationModule {}
