import { Account } from '../entities/account.entity';

export interface AccountRepository {
  create(account: Account): Promise<Account>;
  findById(tenantId: string, id: string): Promise<Account | null>;
  findByIds(tenantId: string, ids: string[]): Promise<Account[]>;
  findByCode(tenantId: string, code: string): Promise<Account | null>;
  findAll(tenantId: string): Promise<Account[]>;
  transactional<T>(cb: (em: unknown) => Promise<T>): Promise<T>;
}

export const ACCOUNT_REPOSITORY = 'ACCOUNT_REPOSITORY';
