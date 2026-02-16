import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TaxRule } from '../../../../domain/src/lib/entities/tax-rule.entity';
import { TaxRuleRepository } from '../../../../domain/src/lib/repositories/tax-rule.repository';

@Injectable()
export class MikroOrmTaxRuleRepository implements TaxRuleRepository {
  constructor(private readonly em: EntityManager) {}

  async findAll(tenantId: string): Promise<TaxRule[]> {
    return this.em.find(TaxRule, { tenantId, isActive: true });
  }

  async save(rule: TaxRule): Promise<void> {
    await this.em.persistAndFlush(rule);
  }

  async createDefaultRules(tenantId: string): Promise<TaxRule[]> {
    const existingCount = await this.em.count(TaxRule, { tenantId });
    if (existingCount > 0) {
      return [];
    }

    const rules = [
      new TaxRule(tenantId, 'IVA 16%', 'IVA', '0.1600', 'General'),
      new TaxRule(tenantId, 'ISR Retención 10%', 'ISR_RET', '0.1000', 'Professional Services'),
      new TaxRule(tenantId, 'IVA Retención 10.6667%', 'IVA_RET', '0.1066', 'Professional Services'),
    ];

    for (const rule of rules) {
      this.em.persist(rule);
    }
    await this.em.flush();
    return rules;
  }
}
