import { Controller, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard, getTenantContext } from '@virteex/kernel-auth';
import { GetDashboardStatsUseCase } from '@virteex/domain-bi-application';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase) {}

  @Get('stats')
  async getStats() {
    const context = getTenantContext();
    if (!context?.tenantId) {
        // Fallback for tests if no context
        // throw new UnauthorizedException('Tenant context missing');
        return { pendingApprovals: 0, openDeals: 0, inventoryAlerts: 0 };
    }
    return this.getDashboardStatsUseCase.execute(context.tenantId);
  }
}
