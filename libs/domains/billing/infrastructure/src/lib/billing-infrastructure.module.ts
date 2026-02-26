import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '@virteex/kernel-auth';
import { FiscalInfrastructureModule } from '@virteex/infra-fiscal-infrastructure';
import {
  Invoice,
  InvoiceItem,
  TaxLine,
  TaxRule,
  PAC_STRATEGY_FACTORY,
  TENANT_CONFIG_REPOSITORY,
  PaymentMethod,
  INVOICE_REPOSITORY,
  PAYMENT_METHOD_REPOSITORY,
  PRODUCT_REPOSITORY,
  CUSTOMER_REPOSITORY,
  BillingDomainModule
} from '@virteex/domain-billing-domain';
import { FISCAL_DOCUMENT_BUILDER_FACTORY } from '@virteex/domain-fiscal-domain';
import { BILLING_TAX_STRATEGY_FACTORY } from '@virteex/domain-billing-domain';

import { FinkokPacProvider } from './providers/finkok-pac.provider';
import { NullPacProvider } from './providers/null-pac.provider';
import { PacStrategyFactoryImpl } from './factories/pac-strategy.factory';
import { FiscalDocumentBuilderFactoryImpl } from './factories/fiscal-document-builder.factory';
import { TaxStrategyFactoryImpl } from './factories/tax-strategy.factory';

import {
    MxFiscalDocumentBuilder,
    UsFiscalDocumentBuilder,
    BrFiscalDocumentBuilder,
    CoFiscalDocumentBuilder
} from '@virteex/infra-fiscal-infrastructure';

import { MxTaxStrategy } from './strategies/mx-tax.strategy';
import { BrTaxStrategy } from './strategies/br-tax.strategy';
import { UsTaxStrategy } from './strategies/us-tax.strategy';

import { MikroOrmInvoiceRepository } from './repositories/mikro-orm-invoice.repository';
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
    AuthModule,
    FiscalInfrastructureModule,
    BillingDomainModule,
    MikroOrmModule.forFeature([
      Invoice,
      InvoiceItem,
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
    // Note: Builders are now provided by FiscalInfrastructureModule
    {
        provide: FISCAL_DOCUMENT_BUILDER_FACTORY,
        useClass: FiscalDocumentBuilderFactoryImpl
    },
    // Strategies
    MxTaxStrategy,
    BrTaxStrategy,
    UsTaxStrategy,
    {
        provide: BILLING_TAX_STRATEGY_FACTORY,
        useClass: TaxStrategyFactoryImpl
    }
  ],
  exports: [
    INVOICE_REPOSITORY,
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
