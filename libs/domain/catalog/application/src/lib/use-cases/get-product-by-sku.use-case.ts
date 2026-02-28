import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_READ_REPOSITORY, ProductReadRepository, Product } from '@virteex/domain-catalog-domain';

@Injectable()
export class GetProductBySkuUseCase {
  constructor(
    @Inject(PRODUCT_READ_REPOSITORY)
    private readonly repository: ProductReadRepository
  ) {}

  async execute(sku: string): Promise<Product | null> {
    return this.repository.findBySku(sku);
  }
}
