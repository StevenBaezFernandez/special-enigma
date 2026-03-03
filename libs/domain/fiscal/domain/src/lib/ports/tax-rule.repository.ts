import { FiscalTaxRule } from '../entities/fiscal-tax-rule.entity';

export interface TaxRuleRepository {
    findByJurisdiction(country: string, taxType?: string): Promise<FiscalTaxRule[]>;
    save(rule: FiscalTaxRule): Promise<void>;
}

export const TAX_RULE_REPOSITORY = 'TAX_RULE_REPOSITORY';
