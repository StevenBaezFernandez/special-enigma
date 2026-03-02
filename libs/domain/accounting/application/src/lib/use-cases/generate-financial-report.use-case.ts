import { Inject, Injectable } from '@nestjs/common';
import {
  JOURNAL_ENTRY_REPOSITORY,
  JournalEntryRepository,
  ACCOUNT_REPOSITORY,
  AccountRepository
} from '@virteex/domain-accounting-domain';
import { Decimal } from 'decimal.js';

export interface FinancialReport {
  tenantId: string;
  type: 'BALANCE_SHEET' | 'PROFIT_AND_LOSS';
  generatedAt: Date;
  lines: FinancialReportLine[];
  dimensions?: Record<string, string>;
}

export interface FinancialReportLine {
  accountName: string;
  accountCode: string;
  balance: string;
}

@Injectable()
export class GenerateFinancialReportUseCase {
  constructor(
    @Inject(JOURNAL_ENTRY_REPOSITORY) private journalEntryRepository: JournalEntryRepository,
    @Inject(ACCOUNT_REPOSITORY) private accountRepository: AccountRepository
  ) {}

  async execute(
    tenantId: string,
    type: 'BALANCE_SHEET' | 'PROFIT_AND_LOSS',
    endDate: Date,
    dimensions?: Record<string, string>
  ): Promise<FinancialReport> {
    const balances = await this.journalEntryRepository.getBalancesByAccount(tenantId, undefined, endDate, dimensions);
    const reportLines: FinancialReportLine[] = [];

    const accounts = await this.accountRepository.findAll(tenantId);

    for (const account of accounts) {
        const balance = balances.get(account.id) || { debit: '0', credit: '0' };
        const netBalance = new Decimal(balance.debit).minus(new Decimal(balance.credit));

        const isIncomeOrExpense = account.type === 'REVENUE' || account.type === 'EXPENSE';

        if (type === 'PROFIT_AND_LOSS' && isIncomeOrExpense) {
            reportLines.push({
                accountName: account.name,
                accountCode: account.code,
                balance: netBalance.toFixed(2)
            });
        } else if (type === 'BALANCE_SHEET' && !isIncomeOrExpense) {
            reportLines.push({
                accountName: account.name,
                accountCode: account.code,
                balance: netBalance.toFixed(2)
            });
        }
    }

    return {
      tenantId,
      type,
      generatedAt: new Date(),
      lines: reportLines,
      dimensions
    };
  }
}
