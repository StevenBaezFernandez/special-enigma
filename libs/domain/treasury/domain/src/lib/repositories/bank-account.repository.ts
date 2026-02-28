import { BankAccount } from '../entities/bank-account.entity';

export const BANK_ACCOUNT_REPOSITORY = 'BANK_ACCOUNT_REPOSITORY';

export interface BankAccountRepository {
  create(bankAccount: BankAccount): Promise<BankAccount>;
  findById(id: string): Promise<BankAccount | null>;
  findAll(tenantId: string): Promise<BankAccount[]>;
}
