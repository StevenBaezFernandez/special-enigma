export interface DashboardMetrics {
  mrr: number;
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  provisioningTenants: number;
  churnRate: number;
  recentActivity: any[];
}

export interface DashboardGateway {
  getMetrics(): Promise<DashboardMetrics>;
}

export const DASHBOARD_GATEWAY = 'DASHBOARD_GATEWAY';
