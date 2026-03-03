import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProvisioningService, ProvisioningStatus } from '../use-cases/provisioning.service';
import { TenantMode, OperationState, OperationType } from '@virteex/kernel-tenant';

describe('Provisioning Operational Validation', () => {
  let service: ProvisioningService;
  let mockConfig: any;
  let mockOrm: any;
  let mockTenantService: any;
  let mockOpService: any;
  let mockRedis: any;

  beforeEach(() => {
    mockConfig = { get: vi.fn().mockReturnValue('redis://localhost:6379') };
    mockOrm = {
        getSchemaGenerator: vi.fn().mockReturnValue({
            createSchema: vi.fn().mockResolvedValue(undefined),
            updateSchema: vi.fn().mockResolvedValue(undefined),
        }),
        getMigrator: vi.fn().mockReturnValue({
            up: vi.fn().mockResolvedValue(undefined),
        }),
        em: {
          fork: vi.fn().mockReturnValue({
            getSchemaGenerator: vi.fn().mockReturnValue({
              createSchema: vi.fn().mockResolvedValue(undefined)
            })
          }),
          getSchemaGenerator: vi.fn().mockReturnThis()
        }
    };
    mockTenantService = { getTenantConfig: vi.fn() };
    mockOpService = {
        createOperation: vi.fn().mockResolvedValue({ operationId: 'op-123' }),
        transitionState: vi.fn().mockResolvedValue(undefined),
    };
    mockRedis = {
        set: vi.fn().mockResolvedValue('OK'),
        del: vi.fn().mockResolvedValue(1),
    };

    service = new ProvisioningService(mockConfig, mockOrm as any, mockTenantService, mockOpService);
    (service as any).redis = mockRedis;
  });

  it('SHOULD complete end-to-end onboarding for SHARED mode', async () => {
    mockTenantService.getTenantConfig.mockResolvedValue({ mode: TenantMode.SHARED, tenantId: 't-shared' });

    await service.startProvisioning('t-shared');

    // Wait for async saga (in a real test we'd use a more robust way to wait)
    await new Promise(r => setTimeout(r, 100));

    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.PREPARING);
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.VALIDATING);
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.SWITCHED);
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.MONITORING);
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.FINALIZED);

    const status = service.getStatus('t-shared');
    expect(status.status).toBe(ProvisioningStatus.COMPLETED);
  });

  it('SHOULD complete onboarding for DATABASE mode with physical isolation', async () => {
    mockTenantService.getTenantConfig.mockResolvedValue({
        mode: TenantMode.DATABASE,
        tenantId: 't-db',
        connectionString: 'postgres://dedicated:5432'
    });

    await service.startProvisioning('t-db');
    await new Promise(r => setTimeout(r, 100));

    expect(mockOrm.em.fork).toHaveBeenCalledWith({ connectionString: 'postgres://dedicated:5432' });
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.FINALIZED);
  });

  it('SHOULD enforce idempotency via Redis locking', async () => {
    mockRedis.set.mockResolvedValue(null); // Lock already held

    await expect(service.startProvisioning('t-locked')).rejects.toThrow(/already in progress/);
  });

  it('SHOULD trigger automatic rollback on failure', async () => {
    mockTenantService.getTenantConfig.mockRejectedValue(new Error('Provisioning Crash'));

    await service.startProvisioning('t-fail');
    await new Promise(r => setTimeout(r, 100));

    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.ROLLBACK, expect.any(Object));
    const status = service.getStatus('t-fail');
    expect(status.status).toBe(ProvisioningStatus.FAILED);
    expect(mockRedis.del).toHaveBeenCalled(); // Lock released
  });
});
