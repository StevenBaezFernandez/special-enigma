import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { TelemetryService } from '@virteex/kernel-telemetry-interfaces';
import { TenantOperationService } from '../tenant-operation.service';
import { OperationType, OperationState } from '../interfaces/tenant-config.interface';

describe('Immutable Journal Integrity Validation', () => {
  let service: TenantOperationService;
  let mockEm: any;
  let mockTelemetry: TelemetryService;

  beforeAll(() => {
    process.env['AUDIT_HMAC_SECRET'] = 'test-secret';
  });

  beforeEach(() => {
    mockTelemetry = {
        recordSecurityEvent: vi.fn(),
        recordBusinessMetric: vi.fn(),
        recordInvoiceEmitted: vi.fn(),
        recordPaymentProcessed: vi.fn(),
        setTraceAttributes: vi.fn()
    } as unknown as TelemetryService;
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
    service = new TenantOperationService(mockEm, mockTelemetry);
  });

  it('SHOULD append every state transition to the journal', async () => {
    const op = { operationId: 'op-123', tenantId: 't1', type: OperationType.MIGRATE, state: OperationState.REQUESTED };
    (mockEm.findOneOrFail as any).mockResolvedValue(op);

    await service.transitionState('op-123', OperationState.PREPARING, { step: 'validation' });

    expect(mockEm.getConnection().execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tenant_operation_journal'),
        expect.arrayContaining(['t1', 'op-123', OperationType.MIGRATE, OperationState.PREPARING])
    );
  });
});
