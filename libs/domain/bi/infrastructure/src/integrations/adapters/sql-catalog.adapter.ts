import { Injectable } from '@nestjs/common';
import { CatalogPort } from '@virteex/domain-bi-domain';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class SqlCatalogAdapter implements CatalogPort {
  constructor(private readonly em: EntityManager) {}

  async getInventoryAlertsCount(tenantId: string): Promise<number> {
    const qb = this.em.getConnection();
    const res = await qb.execute(`
      SELECT count(*) as count
      FROM catalog.product
      WHERE tenant_id = ? AND stock <= min_stock_level
    `, [tenantId]);
    return Number(res[0]?.count || 0);
  }
}
