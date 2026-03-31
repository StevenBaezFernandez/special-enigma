import { Injectable } from '@nestjs/common';
import { TreasuryPort } from '@virteex/domain-bi-domain';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class SqlTreasuryAdapter implements TreasuryPort {
  constructor(private readonly em: EntityManager) {}

  async getCashFlow(tenantId: string): Promise<number> {
    const qb = this.em.getConnection();
    const res = await qb.execute(`
      SELECT sum(balance) as balance
      FROM treasury.bank_account
      WHERE tenant_id = ?
    `, [tenantId]);
    return Number(res[0]?.balance || 0);
  }
}
