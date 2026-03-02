import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { RecordJournalEntryUseCase } from './record-journal-entry.use-case';
import { JOURNAL_ENTRY_REPOSITORY, JournalEntryRepository, ACCOUNT_REPOSITORY, AccountRepository, Account } from '@virteex/domain-accounting-domain';
import { AccountType } from '@virteex/domain-accounting-contracts';

describe('RecordJournalEntryUseCase', () => {
  let service: RecordJournalEntryUseCase;
  let journalRepo: JournalEntryRepository;
  let accountRepo: AccountRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordJournalEntryUseCase,
        {
          provide: JOURNAL_ENTRY_REPOSITORY,
          useValue: {
            create: vi.fn(),
          },
        },
        {
          provide: ACCOUNT_REPOSITORY,
          useValue: {
            findById: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RecordJournalEntryUseCase>(RecordJournalEntryUseCase);
    journalRepo = module.get<JournalEntryRepository>(JOURNAL_ENTRY_REPOSITORY);
    accountRepo = module.get<AccountRepository>(ACCOUNT_REPOSITORY);
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

    const account1 = new Account('tenant1', '100', 'Cash', AccountType.ASSET);
    account1.id = '1';
    const account2 = new Account('tenant1', '200', 'Revenue', AccountType.REVENUE);
    account2.id = '2';

    (accountRepo.findById as any).mockImplementation((id: string) => {
        if (id === '1') return Promise.resolve(account1);
        if (id === '2') return Promise.resolve(account2);
        return Promise.resolve(null);
    });

    (journalRepo.create as any).mockImplementation((entry: any) => {
        return Promise.resolve({
            ...entry,
            id: 'entry1'
        });
    });

    const result = await service.execute(dto);

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

    const account1 = new Account('tenant1', '100', 'Cash', AccountType.ASSET);
    account1.id = '1';
    const account2 = new Account('tenant1', '200', 'Revenue', AccountType.REVENUE);
    account2.id = '2';

    (accountRepo.findById as any).mockImplementation((id: string) => {
        if (id === '1') return Promise.resolve(account1);
        if (id === '2') return Promise.resolve(account2);
        return Promise.resolve(null);
    });

    await expect(service.execute(dto)).rejects.toThrow('Journal Entry is not balanced');
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

      const account1 = new Account('tenant2', '100', 'Cash', AccountType.ASSET);
      account1.id = '1';

      (accountRepo.findById as any).mockResolvedValue(account1);

      await expect(service.execute(dto)).rejects.toThrow('Account 1 belongs to a different tenant');
  });
});
