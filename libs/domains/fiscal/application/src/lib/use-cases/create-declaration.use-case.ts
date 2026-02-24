import { Injectable, Inject } from '@nestjs/common';
import { TaxDeclaration, TaxDeclarationRepository, TAX_DECLARATION_REPOSITORY } from '@virteex/domain-fiscal-domain';

export class CreateDeclarationDto {
  tenantId!: string;
  period!: string;
  amount!: string;
}

@Injectable()
export class CreateDeclarationUseCase {
  constructor(
    @Inject(TAX_DECLARATION_REPOSITORY) private readonly repository: TaxDeclarationRepository
  ) {}

  async execute(dto: CreateDeclarationDto): Promise<TaxDeclaration> {
    const declaration = new TaxDeclaration(dto.tenantId, dto.period, dto.amount);
    await this.repository.save(declaration);
    return declaration;
  }
}
