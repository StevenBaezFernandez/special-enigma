import { Injectable } from '@nestjs/common';
import { DashboardGateway, type DashboardStats } from '@virteex/domain-bi-domain';
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

    // 4. Sales Today
    const salesTodayRes = await qb.execute(`
      SELECT sum(total) as total
      FROM crm.sale
      WHERE tenant_id = ? AND status = 'COMPLETED' AND date(created_at) = CURRENT_DATE
    `, [tenantId]);
    const salesToday = Number(salesTodayRes[0]?.total || 0);

    // 5. EBITDA (Simple approximation: Gross Sales - OpEx recorded)
    const opexRes = await qb.execute(`
      SELECT sum(amount) as amount
      FROM accounting.transaction
      WHERE tenant_id = ? AND account_type = 'EXPENSE' AND date(created_at) >= date_trunc('month', CURRENT_DATE)
    `, [tenantId]);
    const monthlyOpex = Number(opexRes[0]?.amount || 0);

    const monthlySalesRes = await qb.execute(`
      SELECT sum(total) as total
      FROM crm.sale
      WHERE tenant_id = ? AND status = 'COMPLETED' AND date(created_at) >= date_trunc('month', CURRENT_DATE)
    `, [tenantId]);
    const monthlySales = Number(monthlySalesRes[0]?.total || 0);
    const ebitda = monthlySales - monthlyOpex;

    // 6. Net Margin
    const netMargin = monthlySales > 0 ? (ebitda / monthlySales) * 100 : 0;

    // 7. Cash Flow (Current balance across all accounts)
    const cashFlowRes = await qb.execute(`
      SELECT sum(balance) as balance
      FROM treasury.bank_account
      WHERE tenant_id = ?
    `, [tenantId]);
    const cashFlow = Number(cashFlowRes[0]?.balance || 0);

    return {
      pendingApprovals,
      openDeals,
      inventoryAlerts,
      salesToday,
      ebitda,
      netMargin,
      cashFlow
    };
  }
}
