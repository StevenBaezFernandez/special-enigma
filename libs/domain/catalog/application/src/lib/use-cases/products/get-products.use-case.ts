import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_READ_REPOSITORY, type ProductReadRepository, type Product } from '@virteex/domain-catalog-domain';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_READ_REPOSITORY)
    private readonly repository: ProductReadRepository
  ) {}

  async execute(tenantId: string): Promise<Product[]> {
    return this.repository.findAll(tenantId);
  }
}
