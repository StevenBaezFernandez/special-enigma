import { BankAccount } from '../entities/bank-account.entity';

export const BANK_ACCOUNT_REPOSITORY = 'BANK_ACCOUNT_REPOSITORY';

export interface BankAccountRepository {
  save(bankAccount: BankAccount): Promise<void>;
  findById(id: string): Promise<BankAccount | null>;
  findAll(tenantId: string): Promise<BankAccount[]>;
}
