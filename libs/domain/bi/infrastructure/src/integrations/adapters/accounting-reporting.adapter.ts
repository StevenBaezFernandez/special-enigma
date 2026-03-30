import { Injectable } from '@nestjs/common';
import { IAccountingReportingPort } from '@virteex/domain-accounting-contracts';

@Injectable()
export class AccountingReportingAdapter implements IAccountingReportingPort {
  async countJournalEntries(tenantId: string): Promise<number> {
    const baseUrl = process.env['ACCOUNTING_SERVICE_URL'] || 'http://accounting-service:3000';
    try {
      const response = await fetch(`${baseUrl}/api/accounting/journal-entries/count`, {
          headers: { 'x-tenant-id': tenantId }
      });
      if (!response.ok) return 0;
      const data = await response.json();
      return data.count;
    } catch (error) {
      return 0;
    }
  }
}
