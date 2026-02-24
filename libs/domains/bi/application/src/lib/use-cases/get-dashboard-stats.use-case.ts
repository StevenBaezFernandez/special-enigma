import { Injectable } from '@nestjs/common';
import { DashboardGateway, DashboardStats } from '@virteex/domain-bi-domain';

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(private readonly dashboardGateway: DashboardGateway) {}

  async execute(tenantId: string): Promise<DashboardStats> {
    return this.dashboardGateway.getStats(tenantId);
  }
}
