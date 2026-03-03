import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import {
  TAX_DECLARATION_REPOSITORY,
  FISCAL_DATA_PROVIDER,
  TAX_RULE_REPOSITORY,
  TENANT_CONFIG_REPOSITORY,
  HARDWARE_TOKEN_PORT
} from '@virteex/domain-fiscal-domain';
import { MikroOrmTaxDeclarationRepository } from './repositories/mikro-orm-tax-declaration.repository';
import { MikroOrmTaxRuleRepository } from './repositories/mikro-orm-tax-rule.repository';
import { FiscalDataAdapter } from './adapters/fiscal-data.adapter';
import { MikroOrmTenantConfigRepository } from './repositories/mikro-orm-tenant-config.repository';
import { SatFiscalAdapter } from './adapters/sat-fiscal-provider.adapter';
import { SefazFiscalAdapter } from './adapters/sefaz-fiscal-provider.adapter';
import { DianFiscalAdapter } from './adapters/dian-fiscal-provider.adapter';
import { UsTaxPartnerFiscalAdapter } from './adapters/us-tax-partner-fiscal-provider.adapter';
import { DgiiFiscalAdapter } from './adapters/dgii-fiscal-provider.adapter';
import { FiscalProviderFactory } from './factories/fiscal-provider.factory';
import { DesktopHardwareBridge } from './adapters/desktop-hardware-bridge.adapter';
import { MxFiscalDocumentBuilder } from './builders/mx-fiscal-document.builder';
import { UsFiscalDocumentBuilder } from './builders/us-fiscal-document.builder';
import { CoFiscalDocumentBuilder } from './builders/co-fiscal-document.builder';
import { BrFiscalDocumentBuilder } from './builders/br-fiscal-document.builder';
import { DoFiscalDocumentBuilder } from './builders/do-fiscal-document.builder';
import { FiscalTaxRuleRecord } from './entities/fiscal-tax-rule.record';
import { TaxDeclarationRecord } from './entities/tax-declaration.record';
import { FiscalDomainService } from '@virteex/domain-fiscal-domain';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([TaxDeclarationRecord, FiscalTaxRuleRecord]),
    HttpModule,
    ConfigModule
  ],
  providers: [
    {
      provide: TAX_DECLARATION_REPOSITORY,
      useClass: MikroOrmTaxDeclarationRepository
    },
    {
      provide: FISCAL_DATA_PROVIDER,
      useClass: FiscalDataAdapter
    },
    {
      provide: TAX_RULE_REPOSITORY,
      useClass: MikroOrmTaxRuleRepository
    },
    {
      provide: TENANT_CONFIG_REPOSITORY,
      useClass: MikroOrmTenantConfigRepository
    },
    {
        provide: HARDWARE_TOKEN_PORT,
        useClass: DesktopHardwareBridge
    },
    FiscalProviderFactory,
    SatFiscalAdapter,
    SefazFiscalAdapter,
    DianFiscalAdapter,
    UsTaxPartnerFiscalAdapter,
    DgiiFiscalAdapter,
    MxFiscalDocumentBuilder,
    UsFiscalDocumentBuilder,
    CoFiscalDocumentBuilder,
    BrFiscalDocumentBuilder,
    DoFiscalDocumentBuilder,
    FiscalDomainService
  ],
  exports: [
    MikroOrmModule,
    TAX_DECLARATION_REPOSITORY,
    FISCAL_DATA_PROVIDER,
    TAX_RULE_REPOSITORY,
    TENANT_CONFIG_REPOSITORY,
    HARDWARE_TOKEN_PORT,
    FiscalProviderFactory,
    SatFiscalAdapter,
    SefazFiscalAdapter,
    DianFiscalAdapter,
    UsTaxPartnerFiscalAdapter,
    DgiiFiscalAdapter,
    MxFiscalDocumentBuilder,
    UsFiscalDocumentBuilder,
    CoFiscalDocumentBuilder,
    BrFiscalDocumentBuilder,
    DoFiscalDocumentBuilder,
    FiscalDomainService
  ]
})
export class FiscalInfrastructureModule {}
