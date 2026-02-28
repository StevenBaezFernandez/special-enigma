import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { FiscalTaxRule } from '../../../../domain/src/lib/entities/fiscal-tax-rule.entity';
import { TaxRuleRepository } from '../../../../domain/src/lib/ports/tax-rule.repository';

@Injectable()
export class MikroOrmTaxRuleRepository implements TaxRuleRepository {
  constructor(private readonly em: EntityManager) {}

  async findByTenant(tenantId: string): Promise<FiscalTaxRule[]> {
    return this.em.find(FiscalTaxRule, { tenantId, isActive: true });
  }

  async save(rule: FiscalTaxRule): Promise<void> {
    await this.em.persistAndFlush(rule);
  }

  async createDefaultRules(tenantId: string): Promise<FiscalTaxRule[]> {
    const existingCount = await this.em.count(FiscalTaxRule, { tenantId });
    if (existingCount > 0) {
      return [];
    }

    const rules = [
      new FiscalTaxRule(tenantId, 'IVA 16%', 'IVA', '0.1600', 'General'),
      new FiscalTaxRule(tenantId, 'ISR Retención 10%', 'ISR_RET', '0.1000', 'Professional Services'),
      new FiscalTaxRule(tenantId, 'IVA Retención 10.6667%', 'IVA_RET', '0.1066', 'Professional Services'),
    ];

    for (const rule of rules) {
      this.em.persist(rule);
    }
    await this.em.flush();
    return rules;
  }
}
