import { JournalEntryStatus } from '../enums/journal-entry-status.enum';
import { JournalEntryType } from '../enums/journal-entry-type.enum';
import type { JournalEntryLine } from './journal-entry-line.entity';
import { Decimal } from 'decimal.js';
import { NegativeAmountError, JournalEntryNotBalancedError } from '../errors/accounting.errors';

export class JournalEntry {
  id!: string;
  tenantId!: string;
  date!: Date;
  description!: string;
  status: JournalEntryStatus = JournalEntryStatus.DRAFT;
  type: JournalEntryType = JournalEntryType.REGULAR;
  reference?: string;
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
    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    for (const line of this.lines) {
      const debit = new Decimal(line.debit);
      const credit = new Decimal(line.credit);

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
