import { Injectable, Inject } from '@nestjs/common';
import { TaxRuleRepository, TAX_RULE_REPOSITORY, FiscalTaxRule } from '@virteex/domain-fiscal-domain';

@Injectable()
export class GetTaxRulesUseCase {
  constructor(
    @Inject(TAX_RULE_REPOSITORY) private readonly taxRuleRepository: TaxRuleRepository
  ) {}

  async execute(tenantId: string) {
    // Correctly using findByTenant as per interface
    const rules = await this.taxRuleRepository.findByTenant(tenantId);

    return rules.map((r: FiscalTaxRule) => ({
      id: r.id,
      name: r.name,
      rate: Number(r.rate),
      type: r.type,
      appliesTo: r.appliesTo
    }));
  }
}
