import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobProcessorService } from './job-processor.service';

describe('JobProcessorService tenant adversarial checks', () => {
  const flush = vi.fn().mockResolvedValue(undefined);
  const findOne = vi.fn();

  const service = new JobProcessorService(
    { findOne, flush } as any,
    { process: vi.fn(async (_id: string, _worker: string, cb: () => Promise<void>) => cb()) } as any,
    { handleInvoiceIssued: vi.fn() } as any,
    { handlePaymentFailed: vi.fn() } as any
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks jobs where payload tenantId mismatches persisted tenantId', async () => {
    findOne.mockResolvedValue({
      id: 'job-1',
      tenantId: 'tenant-a',
      payload: { tenantId: 'tenant-b' },
      type: 'fiscal.invoice_issued',
      attempts: 0,
      maxAttempts: 3,
    });

    await expect((service as any).executeJob('job-1')).rejects.toThrow('mismatched tenant context payload');
  });
});
