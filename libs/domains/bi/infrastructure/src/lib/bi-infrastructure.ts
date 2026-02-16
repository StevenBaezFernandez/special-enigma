import { Module } from '@nestjs/common';
import { SALES_PORT, INVOICE_PORT, EXPENSES_PORT } from '@virteex/bi-domain';
import { CrmSalesAdapter } from './adapters/crm-sales.adapter';
import { BiInvoiceAdapter } from './adapters/bi-invoice.adapter';
import { BiExpensesAdapter } from './adapters/bi-expenses.adapter';
import { CrmInfrastructureModule } from '@virteex/crm-infrastructure';
import { BillingInfrastructureModule } from '@virteex/billing-infrastructure';
import { PayrollInfrastructureModule } from '@virteex/payroll-infrastructure';

@Module({
  imports: [
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
    }
  ],
  exports: [SALES_PORT, INVOICE_PORT, EXPENSES_PORT]
})
export class BiInfrastructureModule {}
