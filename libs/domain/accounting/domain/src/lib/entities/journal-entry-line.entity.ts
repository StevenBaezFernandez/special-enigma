import type { JournalEntry } from './journal-entry.entity';
import { Account } from './account.entity';

export class JournalEntryLine {
  id!: string;
  journalEntry!: JournalEntry;
  account!: Account;
  debit = '0';
  credit = '0';
  description?: string;
  currencyId?: string;
  amountCurrency?: string;
  exchangeRate?: string;

  constructor(account: Account, debit: string, credit: string) {
    this.account = account;
    this.debit = debit;
    this.credit = credit;
  }
}
