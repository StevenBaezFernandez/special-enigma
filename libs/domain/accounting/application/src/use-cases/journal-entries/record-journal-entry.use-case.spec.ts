import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RecordJournalEntryUseCase } from './record-journal-entry.use-case';
import { JOURNAL_ENTRY_REPOSITORY, type JournalEntryRepository, ACCOUNT_REPOSITORY, type AccountRepository, Account } from '@virteex/domain-accounting-domain';
import { AccountType } from '@virteex/domain-accounting-contracts';

describe('RecordJournalEntryUseCase', () => {
  let service: RecordJournalEntryUseCase;
  let journalRepo: JournalEntryRepository;
  let accountRepo: AccountRepository;

  beforeEach(() => {
    journalRepo = {
      create: vi.fn(),
      findAll: vi.fn(),
      getBalancesByAccount: vi.fn(),
      findLatestClosedDate: vi.fn().mockResolvedValue(null),
    } as unknown as JournalEntryRepository;
    accountRepo = {
      findById: vi.fn(),
      findByCode: vi.fn(),
      findAll: vi.fn(),
    } as unknown as AccountRepository;
    service = new RecordJournalEntryUseCase(journalRepo, accountRepo);
  });

  it('should create a balanced journal entry', async () => {
    const dto = {
      tenantId: 'tenant1',
      date: new Date(),
      description: 'Test Entry',
      lines: [
        { accountId: '1', debit: '100.00', credit: '0.00' },
        { accountId: '2', debit: '0.00', credit: '100.00' },
      ],
    };

    const account1 = new Account('tenant1', '100', 'Cash', AccountType.ASSET as any);
    account1.id = '1';
    const account2 = new Account('tenant1', '200', 'Revenue', AccountType.REVENUE as any);
    account2.id = '2';

    (accountRepo.findById as any).mockImplementation((tenantId: string, id: string) => {
        if (tenantId === 'tenant1' && id === '1') return Promise.resolve(account1);
        if (tenantId === 'tenant1' && id === '2') return Promise.resolve(account2);
        return Promise.resolve(null);
    });

    (journalRepo.create as any).mockImplementation((entry: any) => {
        return Promise.resolve({
            ...entry,
            id: 'entry1'
        });
    });

    const result = await service.execute(dto);

    expect(journalRepo.findLatestClosedDate).toHaveBeenCalledWith('tenant1');
    expect(result.id).toBe('entry1');
    expect(result.lines).toHaveLength(2);
  });

  it('should throw error if entry is unbalanced', async () => {
    const dto = {
      tenantId: 'tenant1',
      date: new Date(),
      description: 'Unbalanced Entry',
      lines: [
        { accountId: '1', debit: '100.00', credit: '0.00' },
        { accountId: '2', debit: '0.00', credit: '90.00' },
      ],
    };

    const account1 = new Account('tenant1', '100', 'Cash', AccountType.ASSET as any);
    account1.id = '1';
    const account2 = new Account('tenant1', '200', 'Revenue', AccountType.REVENUE as any);
    account2.id = '2';

    (accountRepo.findById as any).mockImplementation((tenantId: string, id: string) => {
        if (tenantId === 'tenant1' && id === '1') return Promise.resolve(account1);
        if (tenantId === 'tenant1' && id === '2') return Promise.resolve(account2);
        return Promise.resolve(null);
    });

    await expect(service.execute(dto)).rejects.toThrow();
  });

  it('should throw error if account belongs to different tenant', async () => {
      const dto = {
        tenantId: 'tenant1',
        date: new Date(),
        description: 'Tenant Mismatch',
        lines: [
          { accountId: '1', debit: '100.00', credit: '0.00' },
        ],
      };

      const account1 = new Account('tenant2', '100', 'Cash', AccountType.ASSET as any);
      account1.id = '1';

      (accountRepo.findById as any).mockResolvedValue(account1);

      await expect(service.execute(dto)).rejects.toThrow();
  });

  it('should throw error if entry date is before latest closed date', async () => {
      const closedDate = new Date('2023-12-31');
      const entryDate = new Date('2023-12-15');
      const dto = {
        tenantId: 'tenant1',
        date: entryDate,
        description: 'Past Entry',
        lines: [
          { accountId: '1', debit: '100.00', credit: '100.00' },
        ],
      };

      (journalRepo.findLatestClosedDate as any).mockResolvedValue(closedDate);

      await expect(service.execute(dto)).rejects.toThrow();
  });
});
