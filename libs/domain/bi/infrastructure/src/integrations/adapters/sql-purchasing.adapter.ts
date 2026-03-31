import { Injectable } from '@nestjs/common';
import { PurchasingPort } from '@virteex/domain-bi-domain';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class SqlPurchasingAdapter implements PurchasingPort {
  constructor(private readonly em: EntityManager) {}

  async getPendingApprovalsCount(tenantId: string): Promise<number> {
    const qb = this.em.getConnection();
    const res = await qb.execute(`
      SELECT count(*) as count
      FROM purchasing.requisition
      WHERE tenant_id = ? AND status = 'PENDING'
    `, [tenantId]);
    return Number(res[0]?.count || 0);
  }
}
