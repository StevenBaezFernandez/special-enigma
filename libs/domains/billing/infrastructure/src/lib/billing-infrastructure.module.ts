import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  Invoice,
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
  PAYMENT_METHOD_REPOSITORY
} from '@virteex/billing-domain';
import { FinkokPacProvider } from './providers/finkok-pac.provider';
import { NullPacProvider } from './providers/null-pac.provider';
import { PacStrategyFactoryImpl } from './factories/pac-strategy.factory';
import { MikroOrmInvoiceRepository } from './repositories/mikro-orm-invoice.repository';
import { MikroOrmSubscriptionRepository } from './repositories/mikro-orm-subscription.repository';
import { MikroOrmSubscriptionPlanRepository } from './repositories/mikro-orm-subscription-plan.repository';
import { MikroOrmPaymentMethodRepository } from './repositories/mikro-orm-payment-method.repository';
import { MikroOrmTenantConfigRepository } from './repositories/mikro-orm-tenant-config.repository';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([
      Invoice,
      Subscription,
      SubscriptionPlan,
      PaymentMethod,
      TaxLine,
      TaxRule
    ])
  ],
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
    FinkokPacProvider,
    NullPacProvider,
    {
      provide: PAC_STRATEGY_FACTORY,
      useClass: PacStrategyFactoryImpl
    },
    // Maintain PAC_PROVIDER for backward compatibility or direct usage,
    // but ideally we should migrate all consumers to factory.
    // For now, let's point it to Finkok as default or remove it.
    // Since we are refactoring, I'll remove it from exports to see breaks,
    // but provide it locally if needed.
    // Actually, I'll remove it to ensure we use the factory.
    {
      provide: TENANT_CONFIG_REPOSITORY,
      useClass: MikroOrmTenantConfigRepository
    }
  ],
  exports: [
    INVOICE_REPOSITORY,
    SUBSCRIPTION_REPOSITORY,
    SUBSCRIPTION_PLAN_REPOSITORY,
    PAYMENT_METHOD_REPOSITORY,
    PAC_STRATEGY_FACTORY,
    TENANT_CONFIG_REPOSITORY,
    MikroOrmModule,
    FinkokPacProvider, // Exporting concrete class might be needed by Factory
    NullPacProvider
  ]
})
export class BillingInfrastructureModule {}
