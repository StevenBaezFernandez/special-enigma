import { type JournalEntryRepository } from '@virteex/domain-accounting-domain';
import { Decimal } from 'decimal.js';

export interface BankStatementLine {
  date: Date;
  description: string;
  amount: string;
  reference: string;
}

export class BankReconciliationUseCase {
  constructor(
    private journalEntryRepository: JournalEntryRepository
  ) {}

  async execute(tenantId: string, accountId: string, statementLines: BankStatementLine[]): Promise<{ matched: number, unmatched: number }> {
    console.log(`[BANK] Starting reconciliation for account ${accountId} in tenant ${tenantId}`);

    const entries = await this.journalEntryRepository.findAll(tenantId);
    let matchedCount = 0;
    let unmatchedCount = 0;

    for (const line of statementLines) {
      const lineAmount = new Decimal(line.amount);

      const match = entries.find(e => {
        const isSameDate = e.date.toDateString() === line.date.toDateString();
        const hasSameAmount = e.lines.some(l => {
          const accountMatch = l.account.id === accountId;
          const amountMatch = new Decimal(l.debit).minus(new Decimal(l.credit)).equals(lineAmount);
          return accountMatch && amountMatch;
        });
        return isSameDate && hasSameAmount;
      });

      if (match) {
        matchedCount++;
        console.log(`[BANK] Matched statement line ${line.reference} with entry ${match.id}`);
      } else {
        unmatchedCount++;
        console.warn(`[BANK] No match found for statement line ${line.reference}`);
      }
    }

    return { matched: matchedCount, unmatched: unmatchedCount };
  }
}
