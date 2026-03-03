import { Transaction } from '../entities/transaction.entity';

export interface TransactionRepository {
  save(transaction: Transaction): Promise<void>;
  findById(id: string): Promise<Transaction | null>;
  findAll(tenantId: string): Promise<Transaction[]>;
  findByBankAccountId(bankAccountId: string): Promise<Transaction[]>;
  getCashFlowReport(tenantId: string, startDate: Date, endDate: Date): Promise<any[]>;
}

export const TRANSACTION_REPOSITORY = 'TRANSACTION_REPOSITORY';
