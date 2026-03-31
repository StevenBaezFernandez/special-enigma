import { type JournalEntryRepository, type AccountRepository, AccountType } from '@virteex/domain-accounting-domain';
import { Decimal } from 'decimal.js';

export interface FinancialReport {
  tenantId: string;
  type: 'BALANCE_SHEET' | 'PROFIT_AND_LOSS' | 'TRIAL_BALANCE';
  generatedAt: Date;
  endDate: Date;
  previousEndDate?: Date;
  lines: FinancialReportLine[];
  dimensions?: Record<string, string>;
  totalBalance: string;
}

export interface FinancialReportLine {
  accountName: string;
  accountCode: string;
  balance: string;
  previousBalance?: string;
  percentageChange?: number;
  isHeader?: boolean;
  level?: number;
}


export class GenerateFinancialReportUseCase {
  constructor(
    private journalEntryRepository: JournalEntryRepository,
    private accountRepository: AccountRepository
  ) {}

  async execute(
    tenantId: string,
    type: 'BALANCE_SHEET' | 'PROFIT_AND_LOSS' | 'TRIAL_BALANCE',
    endDate: Date,
    dimensions?: Record<string, string>
  ): Promise<FinancialReport> {
    const startTime = Date.now();
    console.log(`[SLO] Starting financial report generation for tenant ${tenantId}, type ${type} as of ${endDate.toISOString()}`);

    const previousEndDate = new Date(endDate);
    previousEndDate.setFullYear(previousEndDate.getFullYear() - 1);

    const balances = await this.journalEntryRepository.getBalancesByAccount(tenantId, undefined, endDate, dimensions);
    const previousBalances = await this.journalEntryRepository.getBalancesByAccount(tenantId, undefined, previousEndDate, dimensions);

    const reportLines: FinancialReportLine[] = [];
    const accounts = await this.accountRepository.findAll(tenantId);
    let totalBalance = new Decimal(0);

    // Hierarchical sort by code
    const sortedAccounts = accounts.sort((a, b) => a.code.localeCompare(b.code));

    for (const account of sortedAccounts) {
        const balance = balances.get(account.id) || { debit: '0', credit: '0' };
        const prevBalance = previousBalances.get(account.id) || { debit: '0', credit: '0' };

        const netBalance = new Decimal(balance.debit).minus(new Decimal(balance.credit));
        const netPrevBalance = new Decimal(prevBalance.debit).minus(new Decimal(prevBalance.credit));

        const isIncomeOrExpense = account.type === AccountType.REVENUE || account.type === AccountType.EXPENSE;
        let include = false;

        if (type === 'PROFIT_AND_LOSS' && isIncomeOrExpense) include = true;
        else if (type === 'BALANCE_SHEET' && !isIncomeOrExpense) include = true;
        else if (type === 'TRIAL_BALANCE') include = true;

        if (include) {
            totalBalance = totalBalance.plus(netBalance);

            let percentageChange = 0;
            if (!netPrevBalance.isZero()) {
                percentageChange = netBalance.minus(netPrevBalance).div(netPrevBalance.abs()).mul(100).toNumber();
            }

            reportLines.push({
                accountName: account.name,
                accountCode: account.code,
                balance: netBalance.toFixed(2),
                previousBalance: netPrevBalance.toFixed(2),
                percentageChange: Math.round(percentageChange * 100) / 100,
                level: account.code.split('.').length
            });
        }
    }

    const duration = Date.now() - startTime;
    console.log(`[SLO] Financial report generation for tenant ${tenantId} completed in ${duration}ms`);

    return {
      tenantId,
      type,
      generatedAt: new Date(),
      endDate,
      previousEndDate,
      lines: reportLines,
      dimensions,
      totalBalance: totalBalance.toFixed(2)
    };
  }
}
