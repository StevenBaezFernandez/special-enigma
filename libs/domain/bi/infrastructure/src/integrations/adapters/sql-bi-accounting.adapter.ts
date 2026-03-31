import { Injectable } from '@nestjs/common';
import { BiAccountingPort } from '@virteex/domain-bi-domain';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class SqlBiAccountingAdapter implements BiAccountingPort {
  constructor(private readonly em: EntityManager) {}

  async getMonthlyOpex(tenantId: string): Promise<number> {
    const qb = this.em.getConnection();
    const res = await qb.execute(`
      SELECT sum(amount) as amount
      FROM accounting.transaction
      WHERE tenant_id = ? AND account_type = 'EXPENSE' AND date(created_at) >= date_trunc('month', CURRENT_DATE)
    `, [tenantId]);
    return Number(res[0]?.amount || 0);
  }
}
