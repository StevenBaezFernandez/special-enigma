import { Injectable, Inject, Logger } from '@nestjs/common';
import { type TransactionRepository, TRANSACTION_REPOSITORY, type BankAccountRepository, BANK_ACCOUNT_REPOSITORY } from '@virteex/domain-treasury-domain';
import { BankStatementParser, StatementLine } from '../services/bank-statement-parser.service';

export interface ReconciliationResult {
  matched: { line: StatementLine; transactionId: string }[];
  unmatched: StatementLine[];
  totalProcessed: number;
}

@Injectable()
export class ReconcileBankStatementUseCase {
  private readonly logger = new Logger(ReconcileBankStatementUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepo: TransactionRepository,
    @Inject(BANK_ACCOUNT_REPOSITORY) private readonly bankAccountRepo: BankAccountRepository,
    private readonly parser: BankStatementParser
  ) {}

  async execute(tenantId: string, bankAccountId: string, fileContent: string, format: 'csv' | 'ofx'): Promise<ReconciliationResult> {
    const bankAccount = await this.bankAccountRepo.findById(bankAccountId);
    if (!bankAccount || bankAccount.tenantId !== tenantId) {
       throw new Error('Bank account not found or access denied');
    }

    const lines = format === 'ofx' ? this.parser.parseOfx(fileContent) : this.parser.parseCsv(fileContent);
    const transactions = await this.transactionRepo.findByBankAccountId(bankAccountId);

    const matched: { line: StatementLine; transactionId: string }[] = [];
    const unmatched: StatementLine[] = [];

    for (const line of lines) {
       // Improved matching logic:
       // 1. Exact reference match (Highest priority)
       // 2. Same day + same amount
       // 3. Amount match within 3-day window (Common in banking)

       const match = transactions.find(t => {
         const alreadyMatched = matched.some(m => m.transactionId === t.id);
         if (alreadyMatched) return false;

         const sameReference = t.reference && line.reference && t.reference.trim() === line.reference.trim();
         if (sameReference) return true;

         const sameAmount = Math.abs(t.amount - line.amount) < 0.01;
         if (!sameAmount) return false;

         const tDate = new Date(t.date);
         const lDate = new Date(line.date);
         const dayDiff = Math.abs((tDate.getTime() - lDate.getTime()) / (1000 * 60 * 60 * 24));

         return dayDiff <= 3; // 3-day tolerance window
       });

       if (match) {
          matched.push({ line, transactionId: match.id });
          this.logger.log(`Matched statement line ${line.description} with transaction ${match.id}`);
       } else {
          unmatched.push(line);
          this.logger.warn(`Could not match statement line ${line.description} on ${line.date.toDateString()}`);
       }
    }

    return {
      matched,
      unmatched,
      totalProcessed: lines.length
    };
  }
}
