import { Transaction } from '../entities/transaction.entity';

export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findAll(tenantId: string): Promise<Transaction[]>;
  getCashFlowReport(tenantId: string, startDate: Date, endDate: Date): Promise<any[]>;
}
