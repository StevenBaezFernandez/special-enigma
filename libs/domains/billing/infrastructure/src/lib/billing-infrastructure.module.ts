import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  Invoice,
  InvoiceItem,
  Subscription,
  SubscriptionPlan,
  TaxLine,
  TaxRule,
  PAC_PROVIDER,
  PAC_STRATEGY_FACTORY,
  TENANT_CONFIG_REPOSITORY,
  PaymentMethod,
  INVOICE_REPOSITORY,
  SUBSCRIPTION_REPOSITORY,
  SUBSCRIPTION_PLAN_REPOSITORY,
  PAYMENT_METHOD_REPOSITORY,
  PRODUCT_REPOSITORY,
  CUSTOMER_REPOSITORY,
  BillingDomainModule
} from '@virteex/billing-domain';
import { FISCAL_DOCUMENT_BUILDER_FACTORY } from '../../../domain/src/lib/ports/fiscal-document-builder.port';
import { BILLING_TAX_STRATEGY_FACTORY } from '../../../domain/src/lib/strategies/tax-strategy.factory';

import { FinkokPacProvider } from './providers/finkok-pac.provider';
import { NullPacProvider } from './providers/null-pac.provider';
import { PacStrategyFactoryImpl } from './factories/pac-strategy.factory';
import { FiscalDocumentBuilderFactoryImpl } from './factories/fiscal-document-builder.factory';
import { TaxStrategyFactoryImpl } from './factories/tax-strategy.factory';

import { MxFiscalDocumentBuilder } from './strategies/mx-fiscal-document.builder';
import { UsFiscalDocumentBuilder } from './strategies/us-fiscal-document.builder';
import { MxTaxStrategy } from './strategies/mx-tax.strategy';
import { BrTaxStrategy } from './strategies/br-tax.strategy';

import { MikroOrmInvoiceRepository } from './repositories/mikro-orm-invoice.repository';
import { MikroOrmSubscriptionRepository } from './repositories/mikro-orm-subscription.repository';
import { MikroOrmSubscriptionPlanRepository } from './repositories/mikro-orm-subscription-plan.repository';
import { MikroOrmPaymentMethodRepository } from './repositories/mikro-orm-payment-method.repository';
import { MikroOrmTenantConfigRepository } from './repositories/mikro-orm-tenant-config.repository';
import { LocalProductRepository } from './repositories/local-product.repository';
import { HttpCustomerRepository } from './repositories/http-customer.repository';
import { StripePaymentProvider } from './adapters/stripe-payment-provider.adapter';

import { BillingProductEntity } from './entities/billing-product.entity';
import { ProductEventsController } from './listeners/product-events.controller';

import { XsltService } from '@virteex/shared-infrastructure-xslt';

@Global()
@Module({
  imports: [
    BillingDomainModule,
    MikroOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      Subscription,
      SubscriptionPlan,
      PaymentMethod,
      TaxLine,
      TaxRule,
      BillingProductEntity
    ])
  ],
  controllers: [ProductEventsController],
  providers: [
    {
      provide: INVOICE_REPOSITORY,
      useClass: MikroOrmInvoiceRepository
    },
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: MikroOrmSubscriptionRepository
    },
    {
      provide: SUBSCRIPTION_PLAN_REPOSITORY,
      useClass: MikroOrmSubscriptionPlanRepository
    },
    {
      provide: PAYMENT_METHOD_REPOSITORY,
      useClass: MikroOrmPaymentMethodRepository
    },
    {
      provide: PRODUCT_REPOSITORY,
      useClass: LocalProductRepository
    },
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: HttpCustomerRepository
    },
    FinkokPacProvider,
    NullPacProvider,
    {
      provide: PAC_STRATEGY_FACTORY,
      useClass: PacStrategyFactoryImpl
    },
    {
      provide: TENANT_CONFIG_REPOSITORY,
      useClass: MikroOrmTenantConfigRepository
    },
    {
      provide: 'PaymentProvider',
      useClass: StripePaymentProvider
    },
    // Xslt Service
    XsltService,
    // Builders
    MxFiscalDocumentBuilder,
    UsFiscalDocumentBuilder,
    {
        provide: FISCAL_DOCUMENT_BUILDER_FACTORY,
        useClass: FiscalDocumentBuilderFactoryImpl
    },
    // Strategies
    MxTaxStrategy,
    BrTaxStrategy,
    {
        provide: BILLING_TAX_STRATEGY_FACTORY,
        useClass: TaxStrategyFactoryImpl
    }
  ],
  exports: [
    INVOICE_REPOSITORY,
    SUBSCRIPTION_REPOSITORY,
    SUBSCRIPTION_PLAN_REPOSITORY,
    PAYMENT_METHOD_REPOSITORY,
    PRODUCT_REPOSITORY,
    CUSTOMER_REPOSITORY,
    PAC_STRATEGY_FACTORY,
    TENANT_CONFIG_REPOSITORY,
    FISCAL_DOCUMENT_BUILDER_FACTORY,
    BILLING_TAX_STRATEGY_FACTORY,
    MikroOrmModule,
    FinkokPacProvider,
    NullPacProvider,
    'PaymentProvider'
  ]
})
export class BillingInfrastructureModule {}
