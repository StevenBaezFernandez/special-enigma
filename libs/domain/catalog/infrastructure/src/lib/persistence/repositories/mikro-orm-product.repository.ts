import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Product } from '@virteex/domain-catalog-domain';
import { type ProductRepository } from '@virteex/domain-catalog-domain';

@Injectable()
export class MikroOrmProductRepository implements ProductRepository {
  constructor(private readonly em: EntityManager) {}

  async findAll(tenantId: string): Promise<Product[]> {
    return this.em.find(Product, { tenantId } as any);
  }

  async create(product: Product): Promise<Product> {
    this.em.persist(product);
    await this.em.flush();
    return product;
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.em.findOne(Product, { sku } as any);
  }

  async save(product: Product): Promise<void> {
    this.em.persist(product);
    await this.em.flush();
  }

  async findById(id: number): Promise<Product | null> {
    return this.em.findOne(Product, { id } as any);
  }

  async delete(id: number): Promise<void> {
    const product = await this.em.findOne(Product, { id } as any);
    if (product) {
      this.em.remove(product);
      await this.em.flush();
    }
  }
}
