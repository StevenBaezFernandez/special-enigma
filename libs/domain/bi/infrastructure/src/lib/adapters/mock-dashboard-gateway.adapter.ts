import { Injectable } from '@nestjs/common';
import { DashboardGateway, DashboardStats } from '@virteex/domain-bi-domain';

@Injectable()
export class MockDashboardGateway extends DashboardGateway {
  async getStats(tenantId: string): Promise<DashboardStats> {
    // In a real implementation, this would call other microservices via HTTP or query a materialized view.
    return {
      pendingApprovals: 3,
      openDeals: 12,
      inventoryAlerts: 5
    };
  }
}
