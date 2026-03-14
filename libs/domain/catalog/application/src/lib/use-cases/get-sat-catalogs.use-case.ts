import { Injectable, Inject } from '@nestjs/common';
import { type SatCatalogRepository, SAT_CATALOG_REPOSITORY } from '@virteex/domain-catalog-domain';

@Injectable()
export class GetSatCatalogsUseCase {
  constructor(
    @Inject(SAT_CATALOG_REPOSITORY) private readonly repository: SatCatalogRepository
  ) {}

  async getPaymentForms() {
    return this.repository.getPaymentForms();
  }

  async getPaymentMethods() {
    return this.repository.getPaymentMethods();
  }

  async getCfdiUsages() {
    return this.repository.getCfdiUsages();
  }
}
