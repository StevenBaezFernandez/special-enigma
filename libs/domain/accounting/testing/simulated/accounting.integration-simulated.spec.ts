import { vi, describe, it, expect } from 'vitest';
import { CreateAccountUseCase } from '../../application/src/use-cases/accounts/create-account.use-case';
import { AccountType } from '@virteex/domain-accounting-contracts';

describe('Accounting Domain E2E', () => {
  const mockTelemetry = {
    setTraceAttributes: vi.fn(),
    recordBusinessMetric: vi.fn(),
  };

  it('should create an account and verify its properties', async () => {
    // Mock repositories
    const mockRepo = {
      findByCode: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation((acc) => {
          const saved = Object.assign(Object.create(Object.getPrototypeOf(acc)), acc);
          saved.id = 'acc-123';
          return Promise.resolve(saved);
      }),
      transactional: vi.fn().mockImplementation((cb) => cb()),
    };
    const mockOutbox = {
      save: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new CreateAccountUseCase(mockRepo as any, mockOutbox as any, mockTelemetry as any);

    const result = await useCase.execute({
      tenantId: 'tenant-1',
      code: '1101',
      name: 'Cash',
      type: AccountType.ASSET,
    });

    expect(result).toBeDefined();
    expect(result.id).toBe('acc-123');
    expect(result.code).toBe('1101');
    expect(mockRepo.create).toHaveBeenCalled();
    expect(mockOutbox.save).toHaveBeenCalled();
    expect(mockTelemetry.recordBusinessMetric).toHaveBeenCalledWith('accounting_create_account_success_total', 1, expect.any(Object));
  });

  it('should rollback and record error metric if outbox fails', async () => {
    const mockRepo = {
      findByCode: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation((acc) => {
          const saved = Object.assign(Object.create(Object.getPrototypeOf(acc)), acc);
          saved.id = 'acc-123';
          return Promise.resolve(saved);
      }),
      transactional: vi.fn().mockImplementation(async (cb) => {
          try {
              return await cb();
          } catch (e) {
              // Simulating rollback
              throw e;
          }
      }),
    };
    const mockOutbox = {
      save: vi.fn().mockRejectedValue(new Error('Outbox DB failure')),
    };

    const useCase = new CreateAccountUseCase(mockRepo as any, mockOutbox as any, mockTelemetry as any);

    await expect(useCase.execute({
      tenantId: 'tenant-1',
      code: '1101',
      name: 'Cash',
      type: AccountType.ASSET,
    })).rejects.toThrow('Outbox DB failure');

    expect(mockTelemetry.recordBusinessMetric).toHaveBeenCalledWith('accounting_create_account_error_total', 1, expect.any(Object));
  });
});
