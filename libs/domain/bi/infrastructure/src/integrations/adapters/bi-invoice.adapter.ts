import { Injectable, Inject } from '@nestjs/common';
import { type InvoicePort, type InvoiceStatusSummary, type ArAging } from '@virteex/domain-bi-domain';
import { INVOICE_REPOSITORY, type InvoiceRepository } from '@virteex/domain-billing-domain';

@Injectable()
export class BiInvoiceAdapter implements InvoicePort {
  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepository: InvoiceRepository
  ) {}

  async getInvoiceStatusSummary(tenantId: string): Promise<InvoiceStatusSummary[]> {
    const invoices  : any[] = await this.invoiceRepository.findByTenantId(tenantId);

    // Simple aggregation for the example
    const summary: Record<string, { count: number; totalAmount: number }> = {};

    invoices.forEach(inv => {
      if (!summary[inv.status]) {
        summary[inv.status] = { count: 0, totalAmount: 0 };
      }
      summary[inv.status].count++;
      summary[inv.status].totalAmount += Number(inv.totalAmount);
    });

    return Object.entries(summary).map(([status, data]) => ({
      status,
      count: data.count,
      totalAmount: data.totalAmount
    }));
  }

  async getArAging(tenantId: string): Promise<ArAging[]> {
    const invoices  : any[] = await this.invoiceRepository.findByTenantId(tenantId);
    const now = new Date();

    const aging: Record<string, number> = {
      'Current': 0,
      '1-30 Days': 0,
      '31-60 Days': 0,
      '61-90 Days': 0,
      '> 90 Days': 0
    };

    for (const inv of invoices) {
        if (inv.status === 'PAID') continue;

        const dueDate = inv.dueDate ? new Date(inv.dueDate) : new Date(inv.issueDate);
        const diffDays = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const amount = Number(inv.totalAmount);

        if (diffDays <= 0) aging['Current'] += amount;
        else if (diffDays <= 30) aging['1-30 Days'] += amount;
        else if (diffDays <= 60) aging['31-60 Days'] += amount;
        else if (diffDays <= 90) aging['61-90 Days'] += amount;
        else aging['> 90 Days'] += amount;
    }

    return Object.entries(aging).map(([bucket, amount]) => ({ bucket, amount }));
  }
}
