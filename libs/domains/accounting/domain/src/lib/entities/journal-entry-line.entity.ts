import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import type { JournalEntry } from './journal-entry.entity';
import { Account } from './account.entity';

@Entity()
export class JournalEntryLine {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne('JournalEntry')
  journalEntry!: JournalEntry;

  @ManyToOne(() => Account)
  account!: Account;

  @Property({ type: 'decimal', precision: 14, scale: 2 })
  debit = '0';

  @Property({ type: 'decimal', precision: 14, scale: 2 })
  credit = '0';

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  currencyId?: string;

  @Property({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  amountCurrency?: string;

  @Property({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  exchangeRate?: string;

  constructor(account: Account, debit: string, credit: string) {
    this.account = account;
    this.debit = debit;
    this.credit = credit;
  }
}
