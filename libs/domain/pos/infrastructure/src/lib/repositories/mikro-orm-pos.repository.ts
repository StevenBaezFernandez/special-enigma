import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { PosSale, PosShift, PosRepository } from '@virteex/domain-pos-domain';

@Injectable()
export class MikroOrmPosRepository implements PosRepository {
  constructor(private readonly em: EntityManager) {}

  async saveSale(sale: PosSale): Promise<void> {
    await this.em.persistAndFlush(sale);
  }

  async findSaleById(id: string): Promise<PosSale | null> {
    return this.em.findOne(PosSale, { id } as any, { populate: ['items'] });
  }

  async saveShift(shift: PosShift): Promise<void> {
    await this.em.persistAndFlush(shift);
  }

  async findActiveShift(tenantId: string, terminalId: string): Promise<PosShift | null> {
    return this.em.findOne(PosShift, { tenantId, terminalId, status: 'OPEN' } as any);
  }
}
