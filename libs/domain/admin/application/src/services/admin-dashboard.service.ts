import { Injectable, Inject, Logger } from '@nestjs/common';
import { type DashboardGateway, DASHBOARD_GATEWAY, type DashboardMetrics } from '@virteex/domain-admin-domain';
import { TenantService, TenantStatus } from '@virteex/kernel-tenant';
import { EntityManager } from '@mikro-orm/core';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminDashboardService {
  private readonly logger = new Logger(AdminDashboardService.name);

  constructor(
    @Inject(DASHBOARD_GATEWAY) private readonly dashboardGateway: DashboardGateway,
    private readonly tenantService: TenantService,
    private readonly em: EntityManager
  ) {}

  async getMetrics(): Promise<DashboardMetrics> {
    const gatewayMetrics = await this.dashboardGateway.getMetrics();

    // Aggregate real tenant data
    const tenants = await this.tenantService.listTenants(1000);

    // We need to count by status, which is in TenantControlRecord.
    // Since we don't want to overcomplicate the gateway, we'll query directly here for internal metrics.
    const controlRecords = await this.em.getConnection().execute('SELECT status, count(*) as count FROM tenant_control_records GROUP BY status');

    const statusCounts: Record<string, number> = {};
    controlRecords.forEach((r: any) => {
        statusCounts[r.status] = parseInt(r.count);
    });

    const recentActivity = this.getRecentActivity();

    return {
      ...gatewayMetrics,
      totalTenants: tenants.length,
      activeTenants: statusCounts[TenantStatus.ACTIVE] || 0,
      suspendedTenants: statusCounts[TenantStatus.SUSPENDED] || 0,
      provisioningTenants: statusCounts[TenantStatus.PROVISIONING] || 0,
      recentActivity
    };
  }

  private getRecentActivity(): any[] {
    const evidenceDir = path.join(process.cwd(), 'evidence/tenant-lifecycle');
    if (!fs.existsSync(evidenceDir)) return [];

    try {
        const files = fs.readdirSync(evidenceDir)
            .sort()
            .reverse()
            .slice(0, 10);

        return files.map(file => {
            const content = fs.readFileSync(path.join(evidenceDir, file), 'utf-8');
            return JSON.parse(content);
        });
    } catch (err) {
        this.logger.error('Failed to read recent activity', err);
        return [];
    }
  }
}
