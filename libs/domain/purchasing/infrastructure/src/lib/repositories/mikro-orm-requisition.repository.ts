import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Requisition, RequisitionRepository } from '@virteex/domain-purchasing-domain';

@Injectable()
export class MikroOrmRequisitionRepository implements RequisitionRepository {
  constructor(private readonly em: EntityManager) {}

  async save(requisition: Requisition): Promise<void> {
    await this.em.persistAndFlush(requisition);
  }

  async findAll(tenantId: string): Promise<Requisition[]> {
    return this.em.find(Requisition, { tenantId });
  }

  async findById(id: string): Promise<Requisition | null> {
    return this.em.findOne(Requisition, { id });
  }
}
