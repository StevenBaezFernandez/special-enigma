import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinOpsService } from '../finops.service';

describe('FinOps Precision Quantification', () => {
  let service: FinOpsService;
  let mockTelemetry: any;
  let mockEm: any;

  beforeEach(() => {
    mockTelemetry = {
      recordBusinessMetric: vi.fn(),
    };
    mockEm = {
        getConnection: vi.fn().mockReturnValue({
            execute: vi.fn().mockImplementation(async (query: string, params: any[]) => {
                if (query.includes('FROM cloud_pricing_catalog')) {
                    const region = params[0];
                    const resource = params[1];
                    const rates: any = {
                        'us-east-1': { cpu: 0.045, storage: 0.08, iops: 0.008 },
                        'sa-east-1': { cpu: 0.063, storage: 0.112, iops: 0.0112 },
                    };
                    const rate = rates[region]?.[resource];
                    return rate ? [{ rate_usd: rate }] : [];
                }
                return [];
            })
        })
    };
    service = new FinOpsService(mockTelemetry, mockEm);
  });

  it('SHOULD attribute costs accurately based on resource consumption and mode', async () => {
    // Scenario 1: SHARED mode CPU consumption in us-east-1
    await service.recordResourceUsage('t1', 'SHARED', 'us-east-1', 'cpu', 100);

    // us-east-1 rate = 0.045
    // 100 units * 0.045 rate * 1.0 mode = 4.5 USD
    expect(mockTelemetry.recordBusinessMetric).toHaveBeenCalledWith(
      'tenant_resource_cost_observed_usd',
      4.5,
      expect.objectContaining({ tenantId: 't1', mode: 'SHARED', precision: 'reconciled-cloud-cost' })
    );

    // Scenario 2: DATABASE mode Storage consumption in sa-east-1 (Premium rate)
    await service.recordResourceUsage('t2', 'DATABASE', 'sa-east-1', 'storage', 50);

    // sa-east-1 rate = 0.112
    // DATABASE mode multiplier = 1.65
    // 50 units * 0.112 rate * 1.65 mode = 9.24 USD
    expect(mockTelemetry.recordBusinessMetric).toHaveBeenCalledWith(
      'tenant_resource_cost_observed_usd',
      9.24,
      expect.objectContaining({ tenantId: 't2', mode: 'DATABASE' })
    );
  });

  it('SHOULD include mandatory dimensions in all metrics for high-precision filtering', async () => {
      await service.recordResourceUsage('t3', 'SCHEMA', 'us-east-1', 'iops', 1000);

      // us-east-1 rate = 0.008
      // SCHEMA multiplier = 1.15
      // 1000 units * 0.008 rate * 1.15 mode = 9.2 USD
      expect(mockTelemetry.recordBusinessMetric).toHaveBeenCalledWith(
          'tenant_resource_cost_observed_usd',
          9.2,
          expect.objectContaining({
              tenantId: 't3',
              mode: 'SCHEMA',
              region: 'us-east-1',
              resource: 'iops'
          })
      );
  });
});
