import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ProductRepository, BillingProduct } from '@virteex/billing-domain';
import { BillingProductEntity } from '../entities/billing-product.entity';

@Injectable()
export class LocalProductRepository implements ProductRepository {
  private readonly logger = new Logger(LocalProductRepository.name);

  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<BillingProduct | null> {
    const product = await this.em.findOne(BillingProductEntity, { id });
    if (!product || !product.isActive) {
      return null;
    }

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      taxGroup: product.taxGroup,
      fiscalCode: product.fiscalCode
    };
  }
}
