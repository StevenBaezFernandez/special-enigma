import { Account } from '../entities/account.entity';

export interface AccountRepository {
  create(account: Account): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  findByCode(tenantId: string, code: string): Promise<Account | null>;
  findAll(tenantId: string): Promise<Account[]>;
}

export const ACCOUNT_REPOSITORY = 'ACCOUNT_REPOSITORY';
