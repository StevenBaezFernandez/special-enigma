import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CloseFiscalPeriodUseCase } from './close-fiscal-period.use-case';
import { type JournalEntryRepository, type AccountRepository } from '@virteex/domain-accounting-domain';

describe('CloseFiscalPeriodUseCase', () => {
  let service: CloseFiscalPeriodUseCase;
  let journalRepo: JournalEntryRepository;
  let accountRepo: AccountRepository;

  beforeEach(() => {
    journalRepo = {
        getBalancesByAccount: vi.fn(),
        create: vi.fn(),
    } as unknown as JournalEntryRepository;
    accountRepo = {
        findAll: vi.fn(),
        findById: vi.fn(),
    } as unknown as AccountRepository;
    service = new CloseFiscalPeriodUseCase(journalRepo, accountRepo);
  });

  it('should create closing entries to zero out revenue and expense', async () => {
      const balances = new Map();
      balances.set('1', { debit: '100.00', credit: '0.00' });

      (journalRepo.getBalancesByAccount as any).mockResolvedValue(balances);
      (accountRepo.findAll as any).mockResolvedValue([
          { id: '1', name: 'Revenue', code: '400', type: 'REVENUE' },
          { id: '2', name: 'Retained Earnings', code: '300', type: 'EQUITY' }
      ]);
      (accountRepo.findById as any).mockImplementation((id: string) => {
          if (id === '1') return Promise.resolve({ id: '1', name: 'Revenue', code: '400', type: 'REVENUE' });
          if (id === '2') return Promise.resolve({ id: '2', name: 'Retained Earnings', code: '300', type: 'EQUITY' });
          return Promise.resolve(null);
      });

      await service.execute('tenant1', new Date());

      expect(journalRepo.create).toHaveBeenCalled();
  });
});
