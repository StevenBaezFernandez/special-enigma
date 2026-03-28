import { TaxRule } from '../entities/tax-rule.entity';

export interface TaxRuleRepository {
  findApplicableRules(jurisdiction: string, date: Date): Promise<TaxRule[]>;
}

export const TAX_RULE_REPOSITORY = Symbol('TAX_RULE_REPOSITORY');

export class TaxRuleEngine {
  constructor(private readonly taxRuleRepository: TaxRuleRepository) {}

  async getApplicableRules(jurisdiction: string, date: Date = new Date()): Promise<TaxRule[]> {
    return this.taxRuleRepository.findApplicableRules(jurisdiction, date);
  }
}
