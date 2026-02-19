export interface DashboardStats {
  pendingApprovals: number;
  openDeals: number;
  inventoryAlerts: number;
}

export abstract class DashboardGateway {
  abstract getStats(tenantId: string): Promise<DashboardStats>;
}
