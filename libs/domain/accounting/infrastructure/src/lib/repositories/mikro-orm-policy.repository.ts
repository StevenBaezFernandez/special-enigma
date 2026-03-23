import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { type PolicyRepository, AccountingPolicy } from '@virteex/domain-accounting-domain';

@Injectable()
export class MikroOrmPolicyRepository implements PolicyRepository {
  constructor(private readonly em: EntityManager) {}

  async getPolicy(tenantId: string, type: string): Promise<any> {
    const policy = await this.em.findOne(AccountingPolicy, { tenantId, type });
    return policy?.rules || null;
  }

  async savePolicy(tenantId: string, type: string, rules: any): Promise<void> {
    const existing = await this.em.findOne(AccountingPolicy, { tenantId, type });
    if (existing) {
      existing.rules = rules;
      await this.em.persistAndFlush(existing);
    } else {
      const policy = new AccountingPolicy(tenantId, type, rules);
      await this.em.persistAndFlush(policy);
    }
  }
}
