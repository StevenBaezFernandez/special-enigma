import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ISupplierRepository, Supplier } from '@virteex/domain-purchasing-domain';

@Injectable()
export class MikroOrmSupplierRepository implements ISupplierRepository {
  constructor(private readonly em: EntityManager) {}

  async save(supplier: Supplier): Promise<void> {
    await this.em.persistAndFlush(supplier);
  }

  async findById(id: string): Promise<Supplier | null> {
    return this.em.findOne(Supplier, { id });
  }

  async findByTaxId(tenantId: string, taxId: string): Promise<Supplier | null> {
      return this.em.findOne(Supplier, { tenantId, taxId });
  }
}
