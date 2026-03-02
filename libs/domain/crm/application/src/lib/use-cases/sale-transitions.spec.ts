import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ApproveSaleUseCase } from './approve-sale.use-case';
import { CancelSaleUseCase } from './cancel-sale.use-case';
import { CompleteSaleUseCase } from './complete-sale.use-case';
import { SaleStatus } from '@virteex/domain-crm-domain';

vi.mock('@virteex/shared-util-server-server-config', () => ({
  DomainException: class extends Error {
    constructor(message: string, public code: string) {
      super(message);
    }
  },
  ServerConfigModule: { forRoot: vi.fn() },
  FederationSupportModule: {},
  GlobalConfigService: {},
  IdempotencyService: {},
  LoggerService: {},
}));

describe('CRM Sale Transitions', () => {
  let repository: any;

  beforeEach(() => {
    repository = {
      findById: vi.fn(),
      update: vi.fn().mockImplementation(s => Promise.resolve(s))
    };
  });

  it('should persist approval', async () => {
    const useCase = new ApproveSaleUseCase(repository);
    repository.findById.mockResolvedValue({ id: 's1', status: SaleStatus.DRAFT });

    await useCase.execute('s1');

    expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({
        status: SaleStatus.APPROVED
    }));
  });

  it('should persist cancellation', async () => {
    const useCase = new CancelSaleUseCase(repository);
    repository.findById.mockResolvedValue({ id: 's1', status: SaleStatus.NEGOTIATION });

    await useCase.execute('s1');

    expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({
        status: SaleStatus.CANCELLED
    }));
  });

  it('should persist completion', async () => {
    const useCase = new CompleteSaleUseCase(repository);
    repository.findById.mockResolvedValue({ id: 's1', status: SaleStatus.APPROVED });

    await useCase.execute('s1');

    expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({
        status: SaleStatus.COMPLETED
    }));
  });
});
