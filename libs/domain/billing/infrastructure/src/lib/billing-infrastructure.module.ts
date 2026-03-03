import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '@virteex/kernel-auth';
import { FiscalInfrastructureModule } from '@virteex/domain-fiscal-infrastructure';
import {
  PAC_STRATEGY_FACTORY,
  TENANT_CONFIG_REPOSITORY,
  INVOICE_REPOSITORY,
  PAYMENT_METHOD_REPOSITORY,
  PRODUCT_REPOSITORY,
  CUSTOMER_REPOSITORY,
  BillingDomainModule,
} from '@virteex/domain-billing-domain';
import { FISCAL_DOCUMENT_BUILDER_FACTORY } from '@virteex/domain-fiscal-domain';
import { BILLING_TAX_STRATEGY_FACTORY } from '@virteex/domain-billing-domain';

import { FinkokPacProvider } from './providers/finkok-pac.provider';
import { NullPacProvider } from './providers/null-pac.provider';
import { PacStrategyFactoryImpl } from './factories/pac-strategy.factory';
import { FiscalDocumentBuilderFactoryImpl } from './factories/fiscal-document-builder.factory';
import { TaxStrategyFactoryImpl } from './factories/tax-strategy.factory';

import { MxTaxStrategy } from './strategies/mx-tax.strategy';
import { BrTaxStrategy } from './strategies/br-tax.strategy';
import { UsTaxStrategy } from './strategies/us-tax.strategy';
import { DoTaxStrategy } from './strategies/do-tax.strategy';

import { MikroOrmInvoiceRepository } from './repositories/mikro-orm-invoice.repository';
import { MikroOrmPaymentMethodRepository } from './repositories/mikro-orm-payment-method.repository';
import { MikroOrmTenantConfigRepository } from './repositories/mikro-orm-tenant-config.repository';
import { LocalProductRepository } from './repositories/local-product.repository';
import { HttpCustomerRepository } from './repositories/http-customer.repository';
import { StripePaymentProvider } from './adapters/stripe-payment-provider.adapter';
import { InvoiceIntegrationPublisher } from './publishers/invoice-integration.publisher';

import { BillingProductEntity } from './entities/billing-product.entity';
import { InvoiceRecord } from './entities/invoice.record';
import { InvoiceItemRecord } from './entities/invoice-item.record';
import { ProductEventsController } from './listeners/product-events.controller';

import { XsltService } from '@virteex/platform-xslt';
import { DataQualityModule } from '@virteex/platform-data-quality';
import { INVOICE_INTEGRATION_PUBLISHER } from '@virteex/domain-billing-application';
import {
  PaymentMethodSchema,
  TaxLineSchema,
  TaxRuleSchema,
} from './persistence/mikro-orm.schemas';

@Global()
@Module({
  imports: [
    AuthModule,
    FiscalInfrastructureModule,
    BillingDomainModule,
    DataQualityModule,
    MikroOrmModule.forFeature([
      InvoiceRecord,
      InvoiceItemRecord,
      PaymentMethodSchema,
      TaxLineSchema,
      TaxRuleSchema,
      BillingProductEntity,
    ]),
  ],
  controllers: [ProductEventsController],
  providers: [
    {
      provide: INVOICE_REPOSITORY,
      useClass: MikroOrmInvoiceRepository,
    },
    {
      provide: PAYMENT_METHOD_REPOSITORY,
      useClass: MikroOrmPaymentMethodRepository,
    },
    {
      provide: PRODUCT_REPOSITORY,
      useClass: LocalProductRepository,
    },
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: HttpCustomerRepository,
    },
    FinkokPacProvider,
    NullPacProvider,
    {
      provide: PAC_STRATEGY_FACTORY,
      useClass: PacStrategyFactoryImpl,
    },
    {
      provide: TENANT_CONFIG_REPOSITORY,
      useClass: MikroOrmTenantConfigRepository,
    },
    {
      provide: 'PaymentProvider',
      useClass: StripePaymentProvider,
    },
    {
      provide: INVOICE_INTEGRATION_PUBLISHER,
      useClass: InvoiceIntegrationPublisher,
    },
    // Xslt Service
    XsltService,
    // Note: Builders are now provided by FiscalInfrastructureModule
    {
      provide: FISCAL_DOCUMENT_BUILDER_FACTORY,
      useClass: FiscalDocumentBuilderFactoryImpl,
    },
    // Strategies
    MxTaxStrategy,
    BrTaxStrategy,
    UsTaxStrategy,
    DoTaxStrategy,
    {
      provide: BILLING_TAX_STRATEGY_FACTORY,
      useClass: TaxStrategyFactoryImpl,
    },
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
    'PaymentProvider',
    INVOICE_INTEGRATION_PUBLISHER,
  ],
})
export class BillingInfrastructureModule {}
