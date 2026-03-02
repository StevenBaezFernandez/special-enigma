import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
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

    debit = '0';

    credit = '0';

  @Property()
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
