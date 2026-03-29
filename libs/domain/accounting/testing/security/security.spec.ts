import { vi, describe, it, expect } from 'vitest';
import { CreateAccountUseCase } from '../../application/src/use-cases/accounts/create-account.use-case';
import { Account, AccountType, CrossTenantAccessError } from '@virteex/domain-accounting-domain';

describe('Accounting Domain Security', () => {
  const mockTelemetry = {
    setTraceAttributes: vi.fn(),
    recordBusinessMetric: vi.fn(),
  };

  it('should enforce tenant isolation and throw CrossTenantAccessError if accessing parent from different tenant', async () => {
    // Parent account belongs to tenant-2
    const parent = new Account('tenant-2', '1000', 'Assets', AccountType.ASSET);
    parent.id = 'parent-123';

    const mockRepo = {
      findByCode: vi.fn().mockResolvedValue(null),
      findById: vi.fn().mockResolvedValue(parent),
      create: vi.fn(),
      transactional: vi.fn().mockImplementation((cb) => cb()),
    };
    const mockOutbox = {
      save: vi.fn(),
    };

    const useCase = new CreateAccountUseCase(mockRepo as any, mockOutbox as any, mockTelemetry as any);

    // Attempting to create a child account in tenant-1 with parent in tenant-2
    await expect(useCase.execute({
      tenantId: 'tenant-1',
      code: '1101',
      name: 'Cash',
      type: AccountType.ASSET as any,
      parentId: 'parent-123',
    })).rejects.toThrow(CrossTenantAccessError);

    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
