import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BiReport, BI_REPORT_REPOSITORY, SALES_PORT, INVOICE_PORT, EXPENSES_PORT, DashboardGateway } from '@virteex/domain-bi-domain';
import { MikroOrmBiReportRepository } from './persistence/repositories/mikro-orm-bi-report.repository';
import { BiExpensesAdapter } from './integrations/adapters/bi-expenses.adapter';
import { BiInvoiceAdapter } from './integrations/adapters/bi-invoice.adapter';
import { CrmSalesAdapter } from './integrations/adapters/crm-sales.adapter';
import { SqlDashboardGateway } from './integrations/adapters/sql-dashboard-gateway.adapter';
import { AccountingReportingAdapter } from './integrations/adapters/accounting-reporting.adapter';
import { ACCOUNTING_REPORTING_PORT } from '@virteex/domain-accounting-contracts';

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
    ACCOUNTING_REPORTING_PORT,
  ],
})
export class BiInfrastructureModule {}
