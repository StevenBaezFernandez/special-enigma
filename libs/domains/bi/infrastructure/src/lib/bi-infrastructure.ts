import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SALES_PORT, INVOICE_PORT, EXPENSES_PORT, BI_REPORT_REPOSITORY, BiReport, DashboardGateway } from '@virteex/bi-domain'; // Added
import { CrmSalesAdapter } from './adapters/crm-sales.adapter';
import { BiInvoiceAdapter } from './adapters/bi-invoice.adapter';
import { BiExpensesAdapter } from './adapters/bi-expenses.adapter';
import { MockDashboardGateway } from './adapters/mock-dashboard-gateway.adapter'; // Added
import { CrmInfrastructureModule } from '@virteex/crm-infrastructure';
import { BillingInfrastructureModule } from '@virteex/billing-infrastructure';
import { PayrollInfrastructureModule } from '@virteex/payroll-infrastructure';
import { MikroOrmBiReportRepository } from './repositories/mikro-orm-bi-report.repository';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([BiReport]),
    CrmInfrastructureModule,
    BillingInfrastructureModule,
    PayrollInfrastructureModule
  ],
  providers: [
    {
      provide: SALES_PORT,
      useClass: CrmSalesAdapter
    },
    {
      provide: INVOICE_PORT,
      useClass: BiInvoiceAdapter
    },
    {
      provide: EXPENSES_PORT,
      useClass: BiExpensesAdapter
    },
    {
      provide: BI_REPORT_REPOSITORY,
      useClass: MikroOrmBiReportRepository
    },
    {
      provide: DashboardGateway, // Added
      useClass: MockDashboardGateway // Added
    }
  ],
  exports: [SALES_PORT, INVOICE_PORT, EXPENSES_PORT, BI_REPORT_REPOSITORY, DashboardGateway] // Added
})
export class BiInfrastructureModule {}
