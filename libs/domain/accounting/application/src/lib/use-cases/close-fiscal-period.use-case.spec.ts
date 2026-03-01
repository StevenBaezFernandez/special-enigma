import { Test, TestingModule } from '@nestjs/testing';
import { CloseFiscalPeriodUseCase } from './close-fiscal-period.use-case';
import { JOURNAL_ENTRY_REPOSITORY, ACCOUNT_REPOSITORY } from '@virteex/domain-accounting-domain';
import { AccountType } from '@virteex/domain-accounting-contracts';

describe('CloseFiscalPeriodUseCase', () => {
  let useCase: CloseFiscalPeriodUseCase;
  let journalRepo: any;
  let accountRepo: any;

  beforeEach(async () => {
    journalRepo = {
      getBalancesByAccount: jest.fn(),
      create: jest.fn(),
    };
    accountRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloseFiscalPeriodUseCase,
        { provide: JOURNAL_ENTRY_REPOSITORY, useValue: journalRepo },
        { provide: ACCOUNT_REPOSITORY, useValue: accountRepo },
      ],
    }).compile();

    useCase = module.get<CloseFiscalPeriodUseCase>(CloseFiscalPeriodUseCase);
  });

  it('should create closing entries to zero out revenue and expense', async () => {
    const tenantId = 't1';
    const revenueAcc = { id: 'a1', name: 'Revenue', type: AccountType.REVENUE };
    const expenseAcc = { id: 'a2', name: 'Expense', type: AccountType.EXPENSE };
    const equityAcc = { id: 'a3', name: 'Retained Earnings', type: AccountType.EQUITY };

    accountRepo.findAll.mockResolvedValue([revenueAcc, expenseAcc, equityAcc]);
    accountRepo.findById.mockImplementation((id: string) => {
        if (id === 'a1') return revenueAcc;
        if (id === 'a2') return expenseAcc;
        return null;
    });

    const balances = new Map();
    balances.set('a1', { debit: '0.00', credit: '1000.00' });
    balances.set('a2', { debit: '600.00', credit: '0.00' });
    journalRepo.getBalancesByAccount.mockResolvedValue(balances);

    await useCase.execute(tenantId, new Date());

    expect(journalRepo.create).toHaveBeenCalled();
    const entry = journalRepo.create.mock.calls[0][0];
    expect(entry.description).toContain('Fiscal Closing');
  });
});
