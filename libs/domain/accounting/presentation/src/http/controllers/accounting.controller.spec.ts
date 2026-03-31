import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AccountingController } from './accounting.controller';
import {
  type AccountingCommandFacade,
  type AccountingQueryFacade,
} from '@virteex/domain-accounting-application';
import { AccountType } from '@virteex/domain-accounting-contracts';

describe('AccountingController', () => {
  let controller: AccountingController;

  const mockCommandFacade = {
    createAccount: vi.fn(),
    recordJournalEntry: vi.fn(),
    setupChartOfAccounts: vi.fn(),
    closeFiscalPeriod: vi.fn(),
  };
  const mockQueryFacade = {
    getAccounts: vi.fn(),
    getJournalEntries: vi.fn(),
    countJournalEntries: vi.fn(),
    generateFinancialReport: vi.fn(),
  };

  beforeEach(async () => {
    controller = new AccountingController(
      mockCommandFacade as unknown as AccountingCommandFacade,
      mockQueryFacade as unknown as AccountingQueryFacade,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAccount', () => {
    it('should call commandFacade.createAccount', async () => {
      const dto = { code: '101', name: 'Cash', type: AccountType.ASSET };
      const tenantId = 'tenant-1';
      await controller.createAccount(tenantId, dto);
      expect(mockCommandFacade.createAccount).toHaveBeenCalledWith({ ...dto, tenantId });
    });
  });

  describe('getAccounts', () => {
    it('should call queryFacade.getAccounts', async () => {
      const tenantId = 'tenant-1';
      await controller.getAccounts(tenantId);
      expect(mockQueryFacade.getAccounts).toHaveBeenCalledWith(tenantId);
    });
  });

  describe('recordJournalEntry', () => {
    it('should call commandFacade.recordJournalEntry', async () => {
      const dto = {
        date: new Date().toISOString(),
        description: 'Test',
        lines: [],
      };
      const tenantId = 'tenant-1';
      await controller.recordJournalEntry(tenantId, dto as any);
      expect(mockCommandFacade.recordJournalEntry).toHaveBeenCalledWith({
        ...dto,
        tenantId,
      });
    });
  });

  describe('getJournalEntries', () => {
    it('should call queryFacade.getJournalEntries', async () => {
      const tenantId = 'tenant-1';
      await controller.getJournalEntries(tenantId);
      expect(mockQueryFacade.getJournalEntries).toHaveBeenCalledWith(tenantId);
    });
  });

  describe('setupChartOfAccounts', () => {
    it('should call commandFacade.setupChartOfAccounts', async () => {
      const tenantId = 'tenant-1';
      await controller.setupChartOfAccounts(tenantId);
      expect(mockCommandFacade.setupChartOfAccounts).toHaveBeenCalledWith(
        tenantId
      );
    });
  });

  describe('generateFinancialReport', () => {
    it('should call queryFacade.generateFinancialReport', async () => {
      const tenantId = 'tenant-1';
      const dto = { type: 'BALANCE_SHEET', endDate: '2023-12-31' };
      const mockReport = {
        type: 'BALANCE_SHEET',
        endDate: new Date('2023-12-31'),
        generatedAt: new Date(),
        sections: [],
      };
      mockQueryFacade.generateFinancialReport.mockResolvedValue(mockReport);

      await controller.generateFinancialReport(tenantId, dto as any);
      expect(mockQueryFacade.generateFinancialReport).toHaveBeenCalledWith(
        tenantId,
        dto.type,
        expect.any(Date),
        undefined
      );
    });
  });

  describe('closeFiscalPeriod', () => {
    it('should call commandFacade.closeFiscalPeriod', async () => {
      const tenantId = 'tenant-1';
      const dto = { closingDate: '2023-12-31' };
      await controller.closeFiscalPeriod(tenantId, dto as any);
      expect(mockCommandFacade.closeFiscalPeriod).toHaveBeenCalledWith(
        tenantId,
        expect.any(Date)
      );
    });
  });
});
