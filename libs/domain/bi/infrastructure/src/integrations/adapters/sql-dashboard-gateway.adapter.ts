import { Injectable, Inject } from '@nestjs/common';
import {
  DashboardGateway,
  type DashboardStats,
  PURCHASING_PORT,
  PurchasingPort,
  CRM_PORT,
  CrmPort,
  CATALOG_PORT,
  CatalogPort,
  TREASURY_PORT,
  TreasuryPort,
  BI_ACCOUNTING_PORT,
  BiAccountingPort,
} from '@virteex/domain-bi-domain';

@Injectable()
export class SqlDashboardGateway extends DashboardGateway {
  constructor(
    @Inject(PURCHASING_PORT) private readonly purchasingPort: PurchasingPort,
    @Inject(CRM_PORT) private readonly crmPort: CrmPort,
    @Inject(CATALOG_PORT) private readonly catalogPort: CatalogPort,
    @Inject(TREASURY_PORT) private readonly treasuryPort: TreasuryPort,
    @Inject(BI_ACCOUNTING_PORT) private readonly accountingPort: BiAccountingPort
  ) {
    super();
  }

  async getStats(tenantId: string): Promise<DashboardStats> {
    const [
      pendingApprovals,
      openDeals,
      inventoryAlerts,
      salesToday,
      monthlyOpex,
      monthlySales,
      cashFlow,
    ] = await Promise.all([
      this.purchasingPort.getPendingApprovalsCount(tenantId),
      this.crmPort.getOpenDealsCount(tenantId),
      this.catalogPort.getInventoryAlertsCount(tenantId),
      this.crmPort.getSalesToday(tenantId),
      this.accountingPort.getMonthlyOpex(tenantId),
      this.crmPort.getMonthlySales(tenantId),
      this.treasuryPort.getCashFlow(tenantId),
    ]);

    const ebitda = monthlySales - monthlyOpex;
    const netMargin = monthlySales > 0 ? (ebitda / monthlySales) * 100 : 0;

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
