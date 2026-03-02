import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ReconciliationService } from './reconciliation.service';

describe('ReconciliationService', () => {
  let service: ReconciliationService;
  const mockRepo = {
    findAll: vi.fn()
  } as any;

  beforeEach(() => {
    service = new ReconciliationService(mockRepo);
  });

  it('should find an exact match', async () => {
    const lines = [{ date: new Date('2026-03-01'), amount: 100, description: 'Test' }];
    mockRepo.findAll.mockResolvedValue([
        { bankAccountId: 'acc1', amount: 100, date: new Date('2026-03-01'), reconciled: false }
    ]);

    const result = await service.reconcile('tenant1', 'acc1', lines);
    expect(result[0].matchType).toBe('EXACT');
    expect(result[0].confidence).toBe(1.0);
  });
});
