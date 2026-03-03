import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { FiscalTaxRule, TaxRuleRepository } from '@virteex/domain-fiscal-domain';
import { FiscalTaxRuleRecord } from '../entities/fiscal-tax-rule.record';

@Injectable()
export class MikroOrmTaxRuleRepository implements TaxRuleRepository {
  constructor(private readonly em: EntityManager) {}

  async findByJurisdiction(country: string, taxType?: string): Promise<FiscalTaxRule[]> {
    const where: any = { country, isActive: true };
    if (taxType) {
      where.type = taxType;
    }
    return this.em.find(FiscalTaxRuleRecord, where);
  }

  async findByTenant(tenantId: string): Promise<FiscalTaxRule[]> {
    return this.em.find(FiscalTaxRuleRecord, { tenantId, isActive: true });
  }

  async save(rule: FiscalTaxRule): Promise<void> {
    const record = this.toRecord(rule);
    await this.em.persistAndFlush(record);
  }

  async createDefaultRules(tenantId: string): Promise<FiscalTaxRule[]> {
    const existingCount = await this.em.count(FiscalTaxRuleRecord, { tenantId });
    if (existingCount > 0) {
      return [];
    }

    const rules = [
      new FiscalTaxRule(tenantId, 'IVA 16%', 'IVA', '0.1600', 'General'),
      new FiscalTaxRule(tenantId, 'ISR Retención 10%', 'ISR_RET', '0.1000', 'Professional Services'),
      new FiscalTaxRule(tenantId, 'IVA Retención 10.6667%', 'IVA_RET', '0.1066', 'Professional Services'),
    ];

    for (const rule of rules) {
      this.em.persist(this.toRecord(rule));
    }
    await this.em.flush();
    return rules;
  }

  private toRecord(rule: FiscalTaxRule): FiscalTaxRuleRecord {
    const record = new FiscalTaxRuleRecord(rule.tenantId, rule.name, rule.type, rule.rate, rule.appliesTo);
    record.id = rule.id;
    record.isActive = rule.isActive;
    record.createdAt = rule.createdAt;
    record.updatedAt = rule.updatedAt;
    return record;
  }
}
