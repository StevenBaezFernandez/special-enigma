import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantOperationService } from '../tenant-operation.service';
import { OperationType, OperationState } from '../interfaces/tenant-config.interface';

describe('Immutable Journal Integrity Validation', () => {
  let service: TenantOperationService;
  let mockEm: any;

  beforeEach(() => {
    mockEm = {
      findOne: vi.fn(),
      findOneOrFail: vi.fn(),
      create: vi.fn().mockImplementation((_entity, data) => data),
      persistAndFlush: vi.fn(),
      flush: vi.fn(),
      getConnection: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue({ success: true })
      })
    };
    service = new TenantOperationService(mockEm);
  });

  it('SHOULD append every state transition to the journal', async () => {
    const op = { operationId: 'op-123', tenantId: 't1', type: OperationType.MIGRATE, state: OperationState.REQUESTED };
    mockEm.findOneOrFail.mockResolvedValue(op);

    await service.transitionState('op-123', OperationState.PREPARING, { step: 'validation' });

    expect(mockEm.getConnection().execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tenant_operation_journal'),
        expect.arrayContaining(['t1', 'op-123', OperationType.MIGRATE, OperationState.PREPARING])
    );
  });
});
