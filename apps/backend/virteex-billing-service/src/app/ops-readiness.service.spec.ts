import { describe, expect, it, vi } from 'vitest';
import { OpsReadinessService } from './ops-readiness.service';

describe('OpsReadinessService', () => {
  it('returns down when a critical dependency is down', async () => {
    const service = new OpsReadinessService({ get: () => undefined } as any);
    vi.spyOn(service as any, 'checkDatabase').mockResolvedValue({ name: 'database', state: 'down', severity: 'critical', latencyMs: 1 });
    vi.spyOn(service as any, 'checkRedis').mockResolvedValue({ name: 'redis', state: 'up', severity: 'high', latencyMs: 1 });
    vi.spyOn(service as any, 'checkKafka').mockResolvedValue({ name: 'kafka', state: 'up', severity: 'high', latencyMs: 1 });
    vi.spyOn(service as any, 'checkFiscalProvider').mockResolvedValue({ name: 'fiscal-provider', state: 'up', severity: 'critical', latencyMs: 1 });
    vi.spyOn(service as any, 'checkPaymentsProvider').mockResolvedValue({ name: 'payments-provider', state: 'up', severity: 'critical', latencyMs: 1 });

    const result = await service.checkAll();
    expect(result.status).toBe('down');
  });

  it('flags payments provider down when stripe key is missing', async () => {
    const service = new OpsReadinessService({ get: () => undefined } as any);
    const report = await (service as any).checkPaymentsProvider();
    expect(report.state).toBe('down');
  });
});
