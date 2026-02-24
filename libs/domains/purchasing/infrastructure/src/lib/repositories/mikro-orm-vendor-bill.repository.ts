import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { VendorBill, VendorBillRepository } from '@virteex/domain-purchasing-domain';

@Injectable()
export class MikroOrmVendorBillRepository implements VendorBillRepository {
  constructor(private readonly em: EntityManager) {}

  async save(bill: VendorBill): Promise<void> {
    await this.em.persistAndFlush(bill);
  }

  async findById(id: string): Promise<VendorBill | null> {
    return this.em.findOne(VendorBill, { id });
  }

  async findAll(tenantId: string): Promise<VendorBill[]> {
    return this.em.find(VendorBill, { tenantId });
  }
}
