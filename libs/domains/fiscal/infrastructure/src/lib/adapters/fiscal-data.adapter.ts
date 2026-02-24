import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { FiscalDataProvider, FiscalStats } from '../../../../domain/src/lib/ports/fiscal-data-provider.port';
import { Invoice } from '@virteex/domain-billing-domain';

@Injectable()
export class FiscalDataAdapter implements FiscalDataProvider {
  constructor(private readonly em: EntityManager) {}

  async getFiscalStats(tenantId: string): Promise<FiscalStats> {
    // Logic: Sum of (Invoice Total * 0.16) for PAID invoices
    const invoices = await this.em.find(Invoice, { tenantId, status: 'PAID' });

    let totalSales = 0;
    for (const invoice of invoices) {
      // invoice.totalAmount is string (decimal), convert to number
      totalSales += Number(invoice.totalAmount);
    }

    // 16% VAT assumption
    const taxesPayable = totalSales * 0.16;

    // Pending declarations logic could be improved, but for now fixed or based on date
    const pendingDeclarations = 1;

    return {
      taxesPayable,
      pendingDeclarations,
      nextDueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 17),
      status: taxesPayable > 10000 ? 'WARNING' : 'OK'
    };
  }
}
