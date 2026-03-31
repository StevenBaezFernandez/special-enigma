import { Injectable, Inject } from '@nestjs/common';
import { JOURNAL_ENTRY_REPOSITORY, ACCOUNT_REPOSITORY } from '@virteex/domain-accounting-domain';
import type { JournalEntryRepository, AccountRepository } from '@virteex/domain-accounting-domain';
import { AccountType } from '@virteex/domain-accounting-contracts';
import { Decimal } from 'decimal.js';

@Injectable()
export class GetMonthlyOpexUseCase {
  constructor(
    @Inject(JOURNAL_ENTRY_REPOSITORY)
    private readonly journalEntryRepository: JournalEntryRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(tenantId: string): Promise<number> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Get all accounts for the tenant
    const allAccounts = await this.accountRepository.findAll(tenantId);

    // 2. Filter for EXPENSE accounts (OPEX)
    const expenseAccountIds = allAccounts
      .filter(acc => acc.type === AccountType.EXPENSE)
      .map(acc => acc.id);

    if (expenseAccountIds.length === 0) {
      return 0;
    }

    // 3. Get balances for these specific accounts
    const balances = await this.journalEntryRepository.getBalancesByAccount(
      tenantId,
      firstDayOfMonth,
      now,
      {},
      expenseAccountIds
    );

    // 4. Calculate total OPEX
    let totalOpex = new Decimal(0);
    for (const balance of balances.values()) {
      // For expense accounts, debit - credit is the net expense
      totalOpex = totalOpex.plus(
        new Decimal(balance.debit).minus(new Decimal(balance.credit))
      );
    }

    return totalOpex.toNumber();
  }
}
