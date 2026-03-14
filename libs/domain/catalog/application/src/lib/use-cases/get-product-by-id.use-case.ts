import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_READ_REPOSITORY, type ProductReadRepository, type Product } from '@virteex/domain-catalog-domain';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_READ_REPOSITORY)
    private readonly repository: ProductReadRepository
  ) {}

  async execute(id: number): Promise<Product | null> {
    return this.repository.findById(id);
  }
}
