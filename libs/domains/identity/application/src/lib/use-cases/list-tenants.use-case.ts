import { Injectable, Inject } from '@nestjs/common';
import { Company, CompanyRepository } from '@virteex/domain-identity-domain';

@Injectable()
export class ListTenantsUseCase {
  constructor(
    @Inject(CompanyRepository) private readonly companyRepository: CompanyRepository
  ) {}

  async execute(): Promise<Company[]> {
    return this.companyRepository.findAll();
  }
}
