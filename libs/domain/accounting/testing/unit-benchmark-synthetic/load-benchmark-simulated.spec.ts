import { vi, describe, it, expect } from 'vitest';
import { GenerateFinancialReportUseCase } from '@virteex/domain-accounting-application';

describe('Accounting Domain Performance (Gating Benchmark)', () => {
  it('should meet performance requirements for report generation with a large simulated dataset', async () => {
    const totalAccounts = 5000;
    const mockJournalRepo = {
      getBalancesByAccount: vi.fn().mockImplementation(() => {
        const balances = new Map();
        for (let i = 0; i < totalAccounts; i++) {
          balances.set(`acc-${i}`, { debit: '100.00', credit: '50.00' });
        }
        return Promise.resolve(balances);
      }),
    };

    const mockAccountRepo = {
      findAll: vi.fn().mockImplementation(() => {
        const accounts = [];
        for (let i = 0; i < totalAccounts; i++) {
          accounts.push({
            id: `acc-${i}`,
            tenantId: 'tenant-1',
            code: `code-${i}`,
            name: `Account ${i}`,
            type: 'ASSET'
          });
        }
        return Promise.resolve(accounts);
      }),
    };

    const useCase = new GenerateFinancialReportUseCase(mockJournalRepo as any, mockAccountRepo as any);

    // Warm up the engine
    await useCase.execute('tenant-1', 'TRIAL_BALANCE', new Date());

    const startTime = performance.now();
    const result = await useCase.execute('tenant-1', 'TRIAL_BALANCE', new Date());
    const endTime = performance.now();

    const duration = endTime - startTime;
    console.log(`[Performance] Trial Balance generation for ${totalAccounts} accounts took ${duration.toFixed(2)}ms`);

    expect(result.lines).toHaveLength(totalAccounts);
    // Hardening requirement: Financial report generation for 5000 accounts should be under 500ms
    expect(duration).toBeLessThan(500);
  });
});
