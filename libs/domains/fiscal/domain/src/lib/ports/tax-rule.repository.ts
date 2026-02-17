import { FiscalTaxRule } from '../entities/fiscal-tax-rule.entity';

export interface TaxRuleRepository {
  save(rule: FiscalTaxRule): Promise<void>;
  findByTenant(tenantId: string): Promise<FiscalTaxRule[]>;
}

export const TAX_RULE_REPOSITORY = 'TAX_RULE_REPOSITORY';
