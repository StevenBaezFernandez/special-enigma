export interface DashboardMetrics {
  mrr: number;
  activeTenants: number;
  churnRate: number;
}

export interface DashboardGateway {
  getMetrics(): Promise<DashboardMetrics>;
}

export const DASHBOARD_GATEWAY = 'DASHBOARD_GATEWAY';
