import { Injectable, Inject } from '@nestjs/common';
import { TaxRuleRepository, TAX_RULE_REPOSITORY, FiscalTaxRule } from '@virteex/domain-fiscal-domain';

export class CreateTaxRuleDto {
  tenantId!: string;
  name!: string;
  type!: string;
  rate!: string;
  appliesTo?: string;
}

@Injectable()
export class CreateTaxRuleUseCase {
  constructor(
    @Inject(TAX_RULE_REPOSITORY) private readonly taxRuleRepository: TaxRuleRepository
  ) {}

  async execute(dto: CreateTaxRuleDto): Promise<FiscalTaxRule> {
    const rule = new FiscalTaxRule(dto.tenantId, dto.name, dto.type, dto.rate, dto.appliesTo);
    await this.taxRuleRepository.save(rule);
    return rule;
  }
}
