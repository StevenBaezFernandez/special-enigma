import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Sale, SaleRepository } from '@virteex/crm-domain';

@Injectable()
export class MikroOrmSaleRepository implements SaleRepository {
  constructor(private readonly em: EntityManager) {}

  async create(sale: Sale): Promise<Sale> {
    this.em.persist(sale);
    await this.em.flush();
    return sale;
  }

  async findById(id: string): Promise<Sale | null> {
    return this.em.findOne(Sale, { id } as any, { populate: ['items'] });
  }

  async findAll(tenantId: string): Promise<Sale[]> {
    return this.em.find(Sale, { tenantId } as any, { populate: ['items'], orderBy: { createdAt: 'DESC' } });
  }

  async update(sale: Sale): Promise<Sale> {
    await this.em.flush();
    return sale;
  }

  async getTopProducts(tenantId: string, limit: number): Promise<{ name: string; value: number }[]> {
    const qb = this.em.createQueryBuilder(Sale, 's');
    const result = await qb
      .select(['si.productName as name', 'sum(si.quantity * si.price) as value'])
      .join('s.items', 'si')
      .where({ 's.tenantId': tenantId, 's.status': 'COMPLETED' })
      .groupBy('si.productName')
      .orderBy({ value: 'DESC' })
      .limit(limit)
      .execute();

    return result.map((r: any) => ({
      name: r.name,
      value: Number(r.value),
    }));
  }
}
