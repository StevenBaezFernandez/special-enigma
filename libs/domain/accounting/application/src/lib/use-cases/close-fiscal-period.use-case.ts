import { Inject, Injectable } from '@nestjs/common';
import { JOURNAL_ENTRY_REPOSITORY, type JournalEntryRepository, ACCOUNT_REPOSITORY, type AccountRepository, JournalEntry, JournalEntryLine } from '@virteex/domain-accounting-domain';
import { Decimal } from 'decimal.js';

@Injectable()
export class CloseFiscalPeriodUseCase {
  constructor(
    @Inject(JOURNAL_ENTRY_REPOSITORY) private journalEntryRepository: JournalEntryRepository,
    @Inject(ACCOUNT_REPOSITORY) private accountRepository: AccountRepository
  ) {}

  async execute(tenantId: string, closingDate: Date): Promise<void> {
    const balances = await this.journalEntryRepository.getBalancesByAccount(tenantId, undefined, closingDate);
    const accounts = await this.accountRepository.findAll(tenantId);

    let netIncome = new Decimal(0);
    const closingEntries: { accountId: string, amount: Decimal }[] = [];

    for (const account of accounts) {
      if (account.type === 'REVENUE' || account.type === 'EXPENSE') {
        const balance = balances.get(account.id) || { debit: '0', credit: '0' };
        const amount = new Decimal(balance.debit).minus(new Decimal(balance.credit));
        netIncome = netIncome.plus(amount);
        closingEntries.push({ accountId: account.id, amount });
      }
    }

    if (closingEntries.length === 0) return;

    const entry = new JournalEntry(tenantId, `Fiscal Closing - ${closingDate.toISOString().substring(0, 7)}`, closingDate);

    for (const item of closingEntries) {
        const account = await this.accountRepository.findById(item.accountId);
        if (!account) continue;

        const debit = item.amount.isPositive() ? '0.00' : item.amount.abs().toFixed(2);
        const credit = item.amount.isPositive() ? item.amount.abs().toFixed(2) : '0.00';

        entry.addLine(new JournalEntryLine(account, debit, credit));
    }

    const retainedEarningsAccount = (await this.accountRepository.findAll(tenantId)).find(a => a.name.includes('Retained Earnings'));
    if (retainedEarningsAccount) {
        const debit = netIncome.isPositive() ? netIncome.abs().toFixed(2) : '0.00';
        const credit = netIncome.isPositive() ? '0.00' : netIncome.abs().toFixed(2);
        entry.addLine(new JournalEntryLine(retainedEarningsAccount, debit, credit));
    }

    await this.journalEntryRepository.create(entry);
  }
}
