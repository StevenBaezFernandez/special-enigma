import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ApproveSaleUseCase } from '../commands/approve-sale.use-case';
import { CancelSaleUseCase } from '../commands/cancel-sale.use-case';
import { CompleteSaleUseCase } from '../commands/complete-sale.use-case';

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
  let repository  : any;

  beforeEach(() => {
    repository = {
      findById: vi.fn(),
      update: vi.fn().mockImplementation(s => Promise.resolve(s))
    };
  });

  it('should persist approval', async () => {
    const useCase = new ApproveSaleUseCase(repository);
    repository.findById.mockResolvedValue({ id: 's1', status: 'DRAFT' });

    await useCase.execute('s1');

    expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'APPROVED'
    }));
  });

  it('should persist cancellation', async () => {
    const useCase = new CancelSaleUseCase(repository);
    repository.findById.mockResolvedValue({ id: 's1', status: 'NEGOTIATION' });

    await useCase.execute('s1');

    expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'CANCELLED'
    }));
  });

  it('should persist completion', async () => {
    const useCase = new CompleteSaleUseCase(repository);
    repository.findById.mockResolvedValue({ id: 's1', status: 'APPROVED' });

    await useCase.execute('s1');

    expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({
        status: 'COMPLETED'
    }));
  });
});

vi.mock('@virteex/domain-crm-domain', () => ({
  SaleStatus: {
    DRAFT: 'DRAFT',
    NEGOTIATION: 'NEGOTIATION',
    APPROVED: 'APPROVED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  }
}));
