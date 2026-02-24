import { Injectable, Inject } from '@nestjs/common';
import { InvoicePort, InvoiceStatusSummary, ArAging } from '@virteex/domain-bi-domain';
import { INVOICE_REPOSITORY, InvoiceRepository, Invoice } from '@virteex/domain-billing-domain';

@Injectable()
export class BiInvoiceAdapter implements InvoicePort {
  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepository: InvoiceRepository
  ) {}

  async getStatusSummary(tenantId: string): Promise<InvoiceStatusSummary> {
    const invoices: Invoice[] = await this.invoiceRepository.findByTenantId(tenantId);

    const paid = invoices.filter(i => i.status === 'PAID').length;
    const pending = invoices.filter(i => i.status === 'SENT' || i.status === 'DRAFT' || i.status === 'STAMPED').length;
    const overdue = invoices.filter(i => i.status === 'OVERDUE').length;

    return { paid, pending, overdue };
  }

  async getArAging(tenantId: string): Promise<ArAging> {
    // In MikroORM usually findByTenantId returns array directly.
    // Assuming InvoiceRepository implements generic methods matching this signature.
    // Based on billing-domain port, it returns Promise<Invoice[]>.
    const invoices: Invoice[] = await this.invoiceRepository.findByTenantId(tenantId);
    const now = new Date();

    const aging: ArAging = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0 };

    for (const inv of invoices) {
        if (inv.status === 'PAID') continue;

        const issueDate = new Date(inv.issueDate);
        let dueDate: Date;

        if (inv.dueDate) {
            dueDate = new Date(inv.dueDate);
        } else {
             // Fallback for legacy data without dueDate
            dueDate = new Date(issueDate);
            dueDate.setDate(dueDate.getDate() + 30);
        }

        const diffTime = now.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const amount = parseFloat(inv.totalAmount);

        if (diffDays <= 0) {
            aging.current += amount;
        } else {
            if (diffDays <= 30) aging.days30 += amount;
            else if (diffDays <= 60) aging.days60 += amount;
            else if (diffDays <= 90) aging.days90 += amount;
            else aging.over90 += amount;
        }
    }
    return aging;
  }
}
