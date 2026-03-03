import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FinOpsService {
  private readonly logger = new Logger(FinOpsService.name);

  constructor(private readonly telemetry: any) {}

  async recordResourceUsage(
    tenantId: string,
    mode: string,
    region: string,
    resource: 'cpu' | 'storage' | 'iops',
    amount: number
  ): Promise<void> {
    this.logger.log(`Recording resource usage for tenant ${tenantId}: ${amount} ${resource}`);

    const rates = {
      cpu: 0.05,
      storage: 0.10,
      iops: 0.01,
    };

    const multipliers = {
      SHARED: 1.0,
      SCHEMA: 1.2,
      DATABASE: 1.5,
    };

    const baseRate = rates[resource];
    const multiplier = multipliers[mode as keyof typeof multipliers] || 1.0;
    const estimatedCost = amount * baseRate * multiplier;

    // Record cost metric
    this.telemetry.recordBusinessMetric('tenant_estimated_cost_usd', estimatedCost, {
      tenantId,
      mode,
      region,
    });

    // Record consumption metric
    this.telemetry.recordBusinessMetric('tenant_resource_consumption', amount, {
      tenantId,
      mode,
      region,
      resource,
    });
  }
}
