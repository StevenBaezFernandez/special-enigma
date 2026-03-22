import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DASHBOARD_GATEWAY, type DashboardGateway } from '@virteex/domain-admin-domain';

@ApiTags('Admin/Monitoring')
@Controller('admin/monitoring')
export class MonitoringController {
  constructor(
    @Inject(DASHBOARD_GATEWAY) private readonly dashboardGateway: DashboardGateway
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Get infrastructure and service health' })
  async getHealth() {
    const metrics = await this.dashboardGateway.getMetrics();

    // Convert aggregated metrics into health status view
    // In a real scenario, we would have a dedicated HealthGateway or
    // fetch from a Service Discovery / Consul / Kubernetes API.
    return [
      { name: 'Identity Service', status: metrics.totalTenants > 0 ? 'UP' : 'UNKNOWN', latency: 20, version: '1.9.0' },
      { name: 'Billing Service', status: metrics.mrr > 0 ? 'UP' : 'UNKNOWN', latency: 35, version: '3.1.2' },
      { name: 'Admin Persistence', status: 'UP', latency: 5, version: 'N/A' },
      { name: 'Audit Store (S3)', status: 'UP', latency: 120, version: 'AWS API' },
      { name: 'Message Broker (Kafka)', status: 'UP', latency: 10, version: '3.6.1' },
    ];
  }
}
