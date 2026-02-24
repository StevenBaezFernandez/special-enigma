import { Injectable, Inject } from '@nestjs/common';
import { ProductRepository } from '@virteex/domain-catalog-domain/lib/repositories/product.repository';
import { Product } from '@virteex/domain-catalog-domain/lib/entities/product.entity';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly repository: ProductRepository,
  ) {}

  async execute(tenantId: string): Promise<Product[]> {
    return this.repository.findAll(tenantId);
  }
}
