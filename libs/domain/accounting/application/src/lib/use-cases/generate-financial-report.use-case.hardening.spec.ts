import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GenerateFinancialReportUseCase } from './generate-financial-report.use-case';
import { JOURNAL_ENTRY_REPOSITORY, ACCOUNT_REPOSITORY } from '@virteex/domain-accounting-domain';
import { AccountType } from '@virteex/domain-accounting-contracts';

describe('GenerateFinancialReportUseCase Hardening', () => {
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

  it('should pass dimensions to repository', async () => {
    const tenantId = 't1';
    const endDate = new Date();
    const dimensions = { costCenter: 'CC1', project: 'P1' };

    accountRepo.findAll.mockResolvedValue([]);
    journalRepo.getBalancesByAccount.mockResolvedValue(new Map());

    await useCase.execute(tenantId, 'BALANCE_SHEET', endDate, dimensions);

    expect(journalRepo.getBalancesByAccount).toHaveBeenCalledWith(
        tenantId,
        undefined,
        endDate,
        dimensions
    );
  });
});
