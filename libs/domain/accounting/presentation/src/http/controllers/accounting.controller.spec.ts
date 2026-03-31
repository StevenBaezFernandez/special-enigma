import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AccountingController } from './accounting.controller';
import {
  type CreateAccountUseCase,
  type RecordJournalEntryUseCase,
  type GetAccountsUseCase,
  type GetJournalEntriesUseCase,
  type SetupChartOfAccountsUseCase,
  type GenerateFinancialReportUseCase,
  type CloseFiscalPeriodUseCase,
} from '@virteex/domain-accounting-application';
import { AccountType } from '@virteex/domain-accounting-contracts';

describe('AccountingController', () => {
  let controller: AccountingController;

  const mockCreateAccountUseCase = {
    execute: vi.fn(),
  };
  const mockRecordJournalEntryUseCase = {
    execute: vi.fn(),
  };
  const mockGetAccountsUseCase = {
    execute: vi.fn(),
  };
  const mockGetJournalEntriesUseCase = {
    execute: vi.fn(),
  };
  const mockSetupChartOfAccountsUseCase = {
    execute: vi.fn(),
  };
  const mockGenerateFinancialReportUseCase = {
    execute: vi.fn(),
  };
  const mockCloseFiscalPeriodUseCase = {
    execute: vi.fn(),
  };

  beforeEach(async () => {
    controller = new AccountingController(
      mockCreateAccountUseCase as unknown as CreateAccountUseCase,
      mockRecordJournalEntryUseCase as unknown as RecordJournalEntryUseCase,
      mockGetAccountsUseCase as unknown as GetAccountsUseCase,
      mockGetJournalEntriesUseCase as unknown as GetJournalEntriesUseCase,
      mockSetupChartOfAccountsUseCase as unknown as SetupChartOfAccountsUseCase,
      mockGenerateFinancialReportUseCase as unknown as GenerateFinancialReportUseCase,
      mockCloseFiscalPeriodUseCase as unknown as CloseFiscalPeriodUseCase
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAccount', () => {
    it('should call CreateAccountUseCase.execute', async () => {
      const dto = { code: '101', name: 'Cash', type: AccountType.ASSET };
      const tenantId = 'tenant-1';
      await controller.createAccount(tenantId, dto);
      expect(mockCreateAccountUseCase.execute).toHaveBeenCalledWith({ ...dto, tenantId });
    });
  });

  describe('getAccounts', () => {
    it('should call GetAccountsUseCase.execute', async () => {
      const tenantId = 'tenant-1';
      await controller.getAccounts(tenantId);
      expect(mockGetAccountsUseCase.execute).toHaveBeenCalledWith(tenantId);
    });
  });
});
