import { Injectable } from '@nestjs/common';
import { CrmPort } from '@virteex/domain-bi-domain';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class SqlCrmAdapter implements CrmPort {
  constructor(private readonly em: EntityManager) {}

  async getOpenDealsCount(tenantId: string): Promise<number> {
    const qb = this.em.getConnection();
    const res = await qb.execute(`
      SELECT count(*) as count
      FROM crm.sale
      WHERE tenant_id = ? AND status IN ('NEGOTIATION', 'QUALIFIED')
    `, [tenantId]);
    return Number(res[0]?.count || 0);
  }

  async getSalesToday(tenantId: string): Promise<number> {
    const qb = this.em.getConnection();
    const res = await qb.execute(`
      SELECT sum(total) as total
      FROM crm.sale
      WHERE tenant_id = ? AND status = 'COMPLETED' AND date(created_at) = CURRENT_DATE
    `, [tenantId]);
    return Number(res[0]?.total || 0);
  }

  async getMonthlySales(tenantId: string): Promise<number> {
    const qb = this.em.getConnection();
    const res = await qb.execute(`
      SELECT sum(total) as total
      FROM crm.sale
      WHERE tenant_id = ? AND status = 'COMPLETED' AND date(created_at) >= date_trunc('month', CURRENT_DATE)
    `, [tenantId]);
    return Number(res[0]?.total || 0);
  }
}
