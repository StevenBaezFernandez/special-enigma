import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinOpsService } from '../finops.service';

describe('FinOps Precision Quantification', () => {
  let service: FinOpsService;
  let mockTelemetry: any;

  beforeEach(() => {
    mockTelemetry = {
      recordBusinessMetric: vi.fn(),
    };
    service = new FinOpsService(mockTelemetry);
  });

  it('SHOULD attribute costs accurately based on resource consumption and mode', async () => {
    // Scenario 1: SHARED mode CPU consumption in us-east-1
    await service.recordResourceUsage('t1', 'SHARED', 'us-east-1', 'cpu', 100);

    // us-east-1 multiplier = 1.0
    // 100 units * 0.045 rate * 1.0 region * 1.0 mode = 4.5 USD
    expect(mockTelemetry.recordBusinessMetric).toHaveBeenCalledWith(
      'tenant_estimated_cost_usd',
      4.5,
      expect.objectContaining({ tenantId: 't1', mode: 'SHARED' })
    );

    // Scenario 2: DATABASE mode Storage consumption in sa-east-1 (Premium multiplier)
    await service.recordResourceUsage('t2', 'DATABASE', 'sa-east-1', 'storage', 50);

    // sa-east-1 multiplier = 1.4
    // DATABASE mode multiplier = 1.65
    // 50 units * 0.08 rate * 1.4 region * 1.65 mode = 9.24 USD
    expect(mockTelemetry.recordBusinessMetric).toHaveBeenCalledWith(
      'tenant_estimated_cost_usd',
      9.239999999999998,
      expect.objectContaining({ tenantId: 't2', mode: 'DATABASE' })
    );
  });

  it('SHOULD include mandatory dimensions in all metrics for high-precision filtering', async () => {
      await service.recordResourceUsage('t3', 'SCHEMA', 'us-east-1', 'iops', 1000);

      expect(mockTelemetry.recordBusinessMetric).toHaveBeenCalledWith(
          'tenant_resource_consumption',
          1000,
          {
              tenantId: 't3',
              mode: 'SCHEMA',
              region: 'us-east-1',
              resource: 'iops'
          }
      );
  });
});
