import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TaxRule } from '../entities/tax-rule.entity';

@Injectable()
export class TaxRuleEngine {
  constructor(private readonly em: EntityManager) {}

  async getApplicableRules(jurisdiction: string, date: Date = new Date()): Promise<TaxRule[]> {
    const rules = await this.em.find(TaxRule, {
      jurisdiction,
      validFrom: { $lte: date },
      $or: [
        { validTo: { $gte: date } },
        { validTo: null }
      ]
    });
    return rules;
  }
}
