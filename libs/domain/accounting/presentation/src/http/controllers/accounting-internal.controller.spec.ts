import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AccountingInternalController } from './accounting-internal.controller';
import { type AccountingQueryFacade } from '@virteex/domain-accounting-application';

describe('AccountingInternalController', () => {
  let controller: AccountingInternalController;

  const mockQueryFacade = {
    countJournalEntries: vi.fn(),
    getMonthlyOpex: vi.fn(),
  };

  beforeEach(async () => {
    controller = new AccountingInternalController(
      mockQueryFacade as unknown as AccountingQueryFacade,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('countJournalEntries', () => {
    it('should call queryFacade.countJournalEntries', async () => {
      const tenantId = 'tenant-1';
      mockQueryFacade.countJournalEntries.mockResolvedValue(42);
      const result = await controller.countJournalEntries(tenantId);
      expect(mockQueryFacade.countJournalEntries).toHaveBeenCalledWith(tenantId);
      expect(result).toEqual({ count: 42 });
    });
  });

  describe('getMonthlyOpex', () => {
    it('should call queryFacade.getMonthlyOpex', async () => {
      const tenantId = 'tenant-1';
      mockQueryFacade.getMonthlyOpex.mockResolvedValue(1500.50);
      const result = await controller.getMonthlyOpex(tenantId);
      expect(mockQueryFacade.getMonthlyOpex).toHaveBeenCalledWith(tenantId);
      expect(result).toEqual({ amount: 1500.50 });
    });
  });
});
