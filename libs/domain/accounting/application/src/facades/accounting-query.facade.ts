import { Injectable, Inject } from '@nestjs/common';
import { GetAccountsUseCase } from '../use-cases/accounts/get-accounts.use-case';
import { GetJournalEntriesUseCase } from '../use-cases/journal-entries/get-journal-entries.use-case';
import { CountJournalEntriesUseCase } from '../use-cases/journal-entries/count-journal-entries.use-case';
import { GenerateFinancialReportUseCase } from '../use-cases/reports/generate-financial-report.use-case';
import { GetMonthlyOpexUseCase } from '../use-cases/metrics/get-monthly-opex.use-case';
import { FinancialReportType } from '@virteex/domain-accounting-contracts';

@Injectable()
export class AccountingQueryFacade {
  constructor(
    private readonly getAccountsUseCase: GetAccountsUseCase,
    private readonly getJournalEntriesUseCase: GetJournalEntriesUseCase,
    private readonly countJournalEntriesUseCase: CountJournalEntriesUseCase,
    private readonly generateFinancialReportUseCase: GenerateFinancialReportUseCase,
    private readonly getMonthlyOpexUseCase: GetMonthlyOpexUseCase,
  ) {}

  async getAccounts(tenantId: string) {
    return this.getAccountsUseCase.execute(tenantId);
  }

  async getJournalEntries(tenantId: string) {
    return this.getJournalEntriesUseCase.execute(tenantId);
  }

  async countJournalEntries(tenantId: string) {
    return this.countJournalEntriesUseCase.execute(tenantId);
  }

  async generateFinancialReport(
    tenantId: string,
    type: FinancialReportType,
    endDate: Date,
    dimensions?: Record<string, string>,
  ) {
    return this.generateFinancialReportUseCase.execute(
      tenantId,
      type,
      endDate,
      dimensions,
    );
  }

  async getMonthlyOpex(tenantId: string): Promise<number> {
    return this.getMonthlyOpexUseCase.execute(tenantId);
  }
}
