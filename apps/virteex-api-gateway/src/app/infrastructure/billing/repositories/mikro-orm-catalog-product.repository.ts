import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Product } from '@virteex/catalog-domain';
import { ProductRepository, BillingProduct } from '@virteex/billing-domain';

@Injectable()
export class MikroOrmCatalogProductRepository implements ProductRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<BillingProduct | null> {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
        return null;
    }

    const product = await this.em.findOne(Product, { id: numericId });

    if (!product || !product.isActive) {
      return null;
    }

    return {
      id: product.id.toString(),
      name: product.name,
      price: parseFloat(product.price),
      taxGroup: product.taxGroup,
      fiscalCode: product.fiscalCode
    };
  }
}
