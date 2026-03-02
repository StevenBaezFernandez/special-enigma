import { Injectable, Logger, Inject } from '@nestjs/common';
import { StatementLine } from '@virteex/domain-treasury-contracts';
import { TransactionRepository } from '@virteex/domain-treasury-domain/repositories/transaction.repository';

export interface ReconciliationMatch {
    statementLine: StatementLine;
    candidateTransactions: any[];
    confidence: number;
    matchType: 'EXACT' | 'PARTIAL' | 'NONE';
}

@Injectable()
export class ReconciliationService {
    private readonly logger = new Logger(ReconciliationService.name);

    constructor(
        @Inject('TransactionRepository') private readonly transactionRepo: TransactionRepository
    ) {}

    async reconcile(tenantId: string, bankAccountId: string, lines: StatementLine[]): Promise<ReconciliationMatch[]> {
        this.logger.log(`Starting reconciliation for account ${bankAccountId} with ${lines.length} lines`);

        const transactions = await this.transactionRepo.findAll(tenantId);
        const candidatePool = transactions.filter(t => (t as any).bankAccountId === bankAccountId && !(t as any).reconciled);

        return lines.map(line => this.findMatch(line, candidatePool));
    }

    private findMatch(line: StatementLine, candidates: any[]): ReconciliationMatch {
        const exactMatches = candidates.filter(c =>
            Math.abs(c.amount - line.amount) < 0.01 &&
            this.isSameDay(c.date, line.date)
        );

        if (exactMatches.length === 1) {
            return {
                statementLine: line,
                candidateTransactions: exactMatches,
                confidence: 1.0,
                matchType: 'EXACT'
            };
        }

        const amountMatches = candidates.filter(c =>
            Math.abs(c.amount - line.amount) < 0.01 &&
            this.daysBetween(c.date, line.date) <= 3
        );

        if (amountMatches.length > 0) {
             return {
                statementLine: line,
                candidateTransactions: amountMatches,
                confidence: 0.8,
                matchType: 'PARTIAL'
            };
        }

        if (line.reference) {
            const normalizedRef = line.reference.toLowerCase().trim();
            const refMatches = candidates.filter(c => {
                const cRef = (c.reference || '').toLowerCase().trim();
                const cDesc = (c.description || '').toLowerCase().trim();

                return cRef === normalizedRef ||
                       cRef.includes(normalizedRef) ||
                       normalizedRef.includes(cRef) ||
                       cDesc.includes(normalizedRef);
            });

            if (refMatches.length > 0) {
                 return {
                    statementLine: line,
                    candidateTransactions: refMatches,
                    confidence: 0.9,
                    matchType: 'PARTIAL'
                };
            }
        }

        return {
            statementLine: line,
            candidateTransactions: [],
            confidence: 0,
            matchType: 'NONE'
        };
    }

    private isSameDay(d1: Date, d2: Date): boolean {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    }

    private daysBetween(d1: Date, d2: Date): number {
        const diff = Math.abs(d1.getTime() - d2.getTime());
        return diff / (1000 * 60 * 60 * 24);
    }
}
