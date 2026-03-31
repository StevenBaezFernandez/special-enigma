import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  BiReport,
  BI_REPORT_REPOSITORY,
  SALES_PORT,
  INVOICE_PORT,
  EXPENSES_PORT,
  DashboardGateway,
  PURCHASING_PORT,
  CRM_PORT,
  CATALOG_PORT,
  TREASURY_PORT,
  BI_ACCOUNTING_PORT,
} from '@virteex/domain-bi-domain';
import { MikroOrmBiReportRepository } from './persistence/repositories/mikro-orm-bi-report.repository';
import { BiExpensesAdapter } from './integrations/adapters/bi-expenses.adapter';
import { BiInvoiceAdapter } from './integrations/adapters/bi-invoice.adapter';
import { CrmSalesAdapter } from './integrations/adapters/crm-sales.adapter';
import { SqlDashboardGateway } from './integrations/adapters/sql-dashboard-gateway.adapter';
import { AccountingReportingAdapter } from './integrations/adapters/accounting-reporting.adapter';
import { ACCOUNTING_REPORTING_PORT } from '@virteex/domain-accounting-contracts';
import { SqlPurchasingAdapter } from './integrations/adapters/sql-purchasing.adapter';
import { SqlCrmAdapter } from './integrations/adapters/sql-crm.adapter';
import { SqlCatalogAdapter } from './integrations/adapters/sql-catalog.adapter';
import { SqlTreasuryAdapter } from './integrations/adapters/sql-treasury.adapter';
import { SqlBiAccountingAdapter } from './integrations/adapters/sql-bi-accounting.adapter';

@Module({
  imports: [
    MikroOrmModule.forFeature([BiReport]),
  ],
  providers: [
    {
      provide: BI_REPORT_REPOSITORY,
      useClass: MikroOrmBiReportRepository,
    },
    {
      provide: SALES_PORT,
      useClass: CrmSalesAdapter,
    },
    {
      provide: INVOICE_PORT,
      useClass: BiInvoiceAdapter,
    },
    {
      provide: EXPENSES_PORT,
      useClass: BiExpensesAdapter,
    },
    {
      provide: DashboardGateway,
      useClass: SqlDashboardGateway,
    },
    {
      provide: PURCHASING_PORT,
      useClass: SqlPurchasingAdapter,
    },
    {
      provide: CRM_PORT,
      useClass: SqlCrmAdapter,
    },
    {
      provide: CATALOG_PORT,
      useClass: SqlCatalogAdapter,
    },
    {
      provide: TREASURY_PORT,
      useClass: SqlTreasuryAdapter,
    },
    {
      provide: BI_ACCOUNTING_PORT,
      useClass: SqlBiAccountingAdapter,
    },
    {
      provide: ACCOUNTING_REPORTING_PORT,
      useClass: AccountingReportingAdapter,
    },
  ],
  exports: [
    BI_REPORT_REPOSITORY,
    SALES_PORT,
    INVOICE_PORT,
    EXPENSES_PORT,
    DashboardGateway,
    PURCHASING_PORT,
    CRM_PORT,
    CATALOG_PORT,
    TREASURY_PORT,
    BI_ACCOUNTING_PORT,
    ACCOUNTING_REPORTING_PORT,
  ],
})
export class BiInfrastructureModule {}
