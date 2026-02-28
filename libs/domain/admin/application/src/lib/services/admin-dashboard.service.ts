import { Injectable, Inject } from '@nestjs/common';
import { DashboardGateway, DASHBOARD_GATEWAY, DashboardMetrics } from '@virteex/domain-admin-domain';

@Injectable()
export class AdminDashboardService {
  constructor(
    @Inject(DASHBOARD_GATEWAY) private readonly dashboardGateway: DashboardGateway
  ) {}

  async getMetrics(): Promise<DashboardMetrics> {
    return this.dashboardGateway.getMetrics();
  }
}
