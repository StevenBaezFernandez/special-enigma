import { JournalEntryStatus } from '../value-objects/journal-entry-status.enum';
import { JournalEntryType } from '../value-objects/journal-entry-type.enum';
import type { JournalEntryLine } from './journal-entry-line.entity';
import { Money } from '../value-objects/money.vo';
import { NegativeAmountError, JournalEntryNotBalancedError } from '../errors/accounting.errors';

export class JournalEntry {
  id!: string;
  tenantId!: string;
  date!: Date;
  description!: string;
  status: JournalEntryStatus = JournalEntryStatus.DRAFT;
  type: JournalEntryType = JournalEntryType.REGULAR;
  reference?: string;
  dimensions?: Record<string, string>;
  lines: JournalEntryLine[] = [];

  constructor(tenantId: string, description: string, date: Date) {
    this.tenantId = tenantId;
    this.description = description;
    this.date = date;
  }

  addLine(line: JournalEntryLine) {
    this.lines.push(line);
    line.journalEntry = this;
  }

  validateBalance() {
    let totalDebit = Money.zero();
    let totalCredit = Money.zero();

    for (const line of this.lines) {
      const debit = new Money(line.debit);
      const credit = new Money(line.credit);

      if (debit.isNegative() || credit.isNegative()) {
         throw new NegativeAmountError();
      }

      totalDebit = totalDebit.plus(debit);
      totalCredit = totalCredit.plus(credit);
    }

    if (!totalDebit.equals(totalCredit)) {
       throw new JournalEntryNotBalancedError(totalDebit.toFixed(2), totalCredit.toFixed(2));
    }
  }
}
