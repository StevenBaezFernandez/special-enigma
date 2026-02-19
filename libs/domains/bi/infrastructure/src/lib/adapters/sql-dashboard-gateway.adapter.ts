import { Injectable } from '@nestjs/common';
import { DashboardGateway, DashboardStats } from '@virteex/bi-domain';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class SqlDashboardGateway extends DashboardGateway {
  constructor(private readonly em: EntityManager) {
    super();
  }

  async getStats(tenantId: string): Promise<DashboardStats> {
    // Using raw SQL for performance and cross-schema access in a shared-DB architecture (MVP).
    // In a strict microservice setup, this would be an aggregation of HTTP calls.
    const qb = this.em.getConnection();

    // 1. Pending Approvals (Purchasing Requisitions)
    const pendingApprovalsRes = await qb.execute(`
      SELECT count(*) as count
      FROM purchasing.requisition
      WHERE tenant_id = ? AND status = 'PENDING'
    `, [tenantId]);
    const pendingApprovals = Number(pendingApprovalsRes[0]?.count || 0);

    // 2. Open Deals (CRM Sales)
    const openDealsRes = await qb.execute(`
      SELECT count(*) as count
      FROM crm.sale
      WHERE tenant_id = ? AND status IN ('NEGOTIATION', 'QUALIFIED')
    `, [tenantId]);
    const openDeals = Number(openDealsRes[0]?.count || 0);

    // 3. Inventory Alerts (Products below min stock)
    const inventoryAlertsRes = await qb.execute(`
      SELECT count(*) as count
      FROM catalog.product
      WHERE tenant_id = ? AND stock <= min_stock_level
    `, [tenantId]);
    const inventoryAlerts = Number(inventoryAlertsRes[0]?.count || 0);

    return {
      pendingApprovals,
      openDeals,
      inventoryAlerts
    };
  }
}
