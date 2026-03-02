import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GenerateFinancialReportUseCase } from './generate-financial-report.use-case';
import { JOURNAL_ENTRY_REPOSITORY, ACCOUNT_REPOSITORY } from '@virteex/domain-accounting-domain';
import { AccountType } from '@virteex/domain-accounting-contracts';

describe('GenerateFinancialReportUseCase', () => {
  let useCase: GenerateFinancialReportUseCase;
  let journalRepo: any;
  let accountRepo: any;

  beforeEach(async () => {
    journalRepo = {
      getBalancesByAccount: vi.fn(),
    };
    accountRepo = {
      findAll: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateFinancialReportUseCase,
        { provide: JOURNAL_ENTRY_REPOSITORY, useValue: journalRepo },
        { provide: ACCOUNT_REPOSITORY, useValue: accountRepo },
      ],
    }).compile();

    useCase = module.get<GenerateFinancialReportUseCase>(GenerateFinancialReportUseCase);
  });

  it('should generate a Balance Sheet', async () => {
    const tenantId = 't1';
    accountRepo.findAll.mockResolvedValue([
      { id: 'a1', name: 'Cash', code: '101', type: AccountType.ASSET },
      { id: 'a2', name: 'Revenue', code: '401', type: AccountType.REVENUE },
    ]);
    const balances = new Map();
    balances.set('a1', { debit: '100.00', credit: '0.00' });
    balances.set('a2', { debit: '0.00', credit: '100.00' });
    journalRepo.getBalancesByAccount.mockResolvedValue(balances);

    const report = await useCase.execute(tenantId, 'BALANCE_SHEET', new Date());

    expect(report.type).toBe('BALANCE_SHEET');
    expect(report.lines).toHaveLength(1);
    expect(report.lines[0].accountName).toBe('Cash');
    expect(report.lines[0].balance).toBe('100.00');
  });

  it('should generate a P&L', async () => {
    const tenantId = 't1';
    accountRepo.findAll.mockResolvedValue([
      { id: 'a1', name: 'Cash', code: '101', type: AccountType.ASSET },
      { id: 'a2', name: 'Revenue', code: '401', type: AccountType.REVENUE },
    ]);
    const balances = new Map();
    balances.set('a1', { debit: '100.00', credit: '0.00' });
    balances.set('a2', { debit: '0.00', credit: '100.00' });
    journalRepo.getBalancesByAccount.mockResolvedValue(balances);

    const report = await useCase.execute(tenantId, 'PROFIT_AND_LOSS', new Date());

    expect(report.type).toBe('PROFIT_AND_LOSS');
    expect(report.lines).toHaveLength(1);
    expect(report.lines[0].accountName).toBe('Revenue');
    expect(report.lines[0].balance).toBe('-100.00');
  });
});
