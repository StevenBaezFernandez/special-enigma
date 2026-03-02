import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ReconciliationService } from './reconciliation.service';

describe('ReconciliationService Hardening', () => {
  let service: ReconciliationService;
  const mockRepo = {
    findAll: vi.fn()
  } as any;

  beforeEach(() => {
    service = new ReconciliationService(mockRepo);
  });

  it('should find partial match by fuzzy reference', async () => {
    const lines = [{ date: new Date('2026-03-01'), amount: 123.45, reference: 'INV-2026-001' }];
    mockRepo.findAll.mockResolvedValue([
        {
            bankAccountId: 'acc1',
            amount: 123.45,
            date: new Date('2026-03-05'), // Different day
            reference: 'inv-2026-001', // Lowercase match
            reconciled: false
        }
    ]);

    const result = await service.reconcile('tenant1', 'acc1', lines);
    expect(result[0].matchType).toBe('PARTIAL');
    expect(result[0].confidence).toBe(0.9);
  });

  it('should find partial match by reference substring', async () => {
    const lines = [{ date: new Date('2026-03-01'), amount: 500, reference: 'REF123' }];
    mockRepo.findAll.mockResolvedValue([
        {
            bankAccountId: 'acc1',
            amount: 500,
            date: new Date('2026-03-10'),
            description: 'Payment for REF123 transaction',
            reconciled: false
        }
    ]);

    const result = await service.reconcile('tenant1', 'acc1', lines);
    expect(result[0].matchType).toBe('PARTIAL');
    expect(result[0].confidence).toBe(0.9);
  });
});
