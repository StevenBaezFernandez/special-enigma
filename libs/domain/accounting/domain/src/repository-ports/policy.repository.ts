import { AccountingPolicy } from '../entities/accounting-policy.entity';

export interface PolicyRepository {
  getPolicy(tenantId: string, type: string): Promise<unknown>;
  findByTenantAndType(tenantId: string, type: string): Promise<AccountingPolicy | null>;
}

export const POLICY_REPOSITORY = 'POLICY_REPOSITORY';
