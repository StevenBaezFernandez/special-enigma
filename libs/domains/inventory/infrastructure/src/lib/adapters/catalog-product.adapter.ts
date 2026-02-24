import { Injectable, Inject } from '@nestjs/common';
import { ProductGateway } from '@virteex/domain-inventory-domain';
import { ProductRepository } from '@virteex/domain-catalog-domain';

@Injectable()
export class CatalogProductAdapter implements ProductGateway {
  constructor(
    @Inject('ProductRepository') private readonly productRepository: ProductRepository
  ) {}

  async exists(productId: string): Promise<boolean> {
    const id = parseInt(productId, 10);
    if (isNaN(id)) return false;
    const product = await this.productRepository.findById(id);
    return !!product;
  }

  async getTenantId(productId: string): Promise<string | null> {
      const id = parseInt(productId, 10);
      if (isNaN(id)) return null;
      const product = await this.productRepository.findById(id);
      return product ? product.tenantId : null;
  }
}
