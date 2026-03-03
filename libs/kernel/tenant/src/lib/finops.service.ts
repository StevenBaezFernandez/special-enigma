import { Injectable, Logger } from '@nestjs/common';
import { TelemetryService } from '@virteex/kernel-telemetry';

@Injectable()
export class FinOpsService {
  private readonly logger = new Logger(FinOpsService.name);

  constructor(private readonly telemetry: TelemetryService) {}

  async recordResourceUsage(
    tenantId: string,
    mode: string,
    region: string,
    resource: 'cpu' | 'memory' | 'storage' | 'iops',
    value: number
  ) {
    this.logger.log(`FinOps: Recording ${resource} usage for tenant ${tenantId}: ${value}`);

    this.telemetry.recordBusinessMetric('tenant_resource_consumption', value, {
      tenantId,
      mode,
      region,
      resource,
    });

    // p95 cost attribution logic based on tier rates
    const cost = this.calculateEstimatedCost(resource, value, mode);
    this.telemetry.recordBusinessMetric('tenant_estimated_cost_usd', cost, {
      tenantId,
      mode,
      region,
    });
  }

  private calculateEstimatedCost(resource: string, value: number, mode: string): number {
    const rates: Record<string, number> = {
      cpu: 0.05,
      memory: 0.01,
      storage: 0.10,
      iops: 0.005,
    };

    let multiplier = 1.0;
    if (mode === 'DATABASE') multiplier = 1.5; // Dedicated resources premium

    return value * (rates[resource] || 0) * multiplier;
  }
}
