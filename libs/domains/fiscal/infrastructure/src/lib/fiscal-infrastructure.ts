import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import {
  TaxDeclaration,
  TAX_DECLARATION_REPOSITORY,
  FISCAL_DATA_PROVIDER,
  FiscalTaxRule,
  TAX_RULE_REPOSITORY,
  TENANT_CONFIG_REPOSITORY
} from '@virteex/domain-fiscal-domain';
import { MikroOrmTaxDeclarationRepository } from './repositories/mikro-orm-tax-declaration.repository';
import { MikroOrmTaxRuleRepository } from './repositories/mikro-orm-tax-rule.repository';
import { FiscalDataAdapter } from './adapters/fiscal-data.adapter';
import { MikroOrmTenantConfigRepository } from './repositories/mikro-orm-tenant-config.repository';
import { SatFiscalAdapter } from './adapters/sat-fiscal-provider.adapter';
import { MxFiscalDocumentBuilder } from './builders/mx-fiscal-document.builder';
import { UsFiscalDocumentBuilder } from './builders/us-fiscal-document.builder';
import { CoFiscalDocumentBuilder } from './builders/co-fiscal-document.builder';
import { BrFiscalDocumentBuilder } from './builders/br-fiscal-document.builder';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([TaxDeclaration, FiscalTaxRule]),
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
      provide: 'FISCAL_PROVIDER',
      useClass: SatFiscalAdapter
    },
    MxFiscalDocumentBuilder,
    UsFiscalDocumentBuilder,
    CoFiscalDocumentBuilder,
    BrFiscalDocumentBuilder
  ],
  exports: [
    MikroOrmModule,
    TAX_DECLARATION_REPOSITORY,
    FISCAL_DATA_PROVIDER,
    TAX_RULE_REPOSITORY,
    TENANT_CONFIG_REPOSITORY,
    'FISCAL_PROVIDER',
    MxFiscalDocumentBuilder,
    UsFiscalDocumentBuilder,
    CoFiscalDocumentBuilder,
    BrFiscalDocumentBuilder
  ]
})
export class FiscalInfrastructureModule {}
