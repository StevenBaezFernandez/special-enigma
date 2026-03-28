import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProvisioningService, ProvisioningStatus } from '../use-cases/provisioning.service';
import { TenantMode, OperationState } from '@virteex/kernel-tenant';

describe('Provisioning Operational Validation', () => {
  let service: ProvisioningService;
  let mockConfig  : any;
  let mockDbPort  : any;
  let mockTenantService  : any;
  let mockOpService  : any;
  let mockRedis  : any;

  beforeEach(() => {
    mockConfig = { get: vi.fn().mockReturnValue('redis://localhost:6379') };
    mockDbPort = {
        getSchemaGenerator: vi.fn().mockReturnValue({
            createSchema: vi.fn().mockResolvedValue(undefined),
            updateSchema: vi.fn().mockResolvedValue(undefined),
        }),
        getMigrator: vi.fn().mockReturnValue({
            up: vi.fn().mockResolvedValue(undefined),
        }),
        forkEntityManager: vi.fn().mockReturnValue({
          getSchemaGenerator: vi.fn().mockReturnValue({
            createSchema: vi.fn().mockResolvedValue(undefined)
          }),
          getMigrator: vi.fn().mockReturnValue({
            up: vi.fn().mockResolvedValue(undefined)
          }),
          begin: vi.fn().mockResolvedValue(undefined),
          commit: vi.fn().mockResolvedValue(undefined),
          rollback: vi.fn().mockResolvedValue(undefined),
          getConnection: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue([{ cid: 't-shared' }, 1])
          })
        })
    };
    mockTenantService = {
      getTenantConfig: vi.fn(),
      activateTenant: vi.fn().mockResolvedValue(undefined)
    };
    mockOpService = {
        createOperation: vi.fn().mockImplementation((tenantId, type, key) => {
          if (key && key.startsWith('query-')) {
            return Promise.resolve({ operationId: 'op-query', state: OperationState.FINALIZED, result: { status: (service as any).lastStatus } });
          }
          return Promise.resolve({ operationId: 'op-123' });
        }),
        transitionState: vi.fn().mockImplementation((id, state, result) => {
          (service as any).lastStatus = result?.status;
          return Promise.resolve(undefined);
        }),
    };
    mockRedis = {
        set: vi.fn().mockResolvedValue('OK'),
        del: vi.fn().mockResolvedValue(1),
    };

    service = new ProvisioningService(mockConfig, mockDbPort as any, mockTenantService, mockOpService);
    (service as any).redis = mockRedis;
  });

  it('SHOULD complete end-to-end onboarding for SHARED mode', async () => {
    mockTenantService.getTenantConfig.mockResolvedValue({ mode: TenantMode.SHARED, tenantId: 't-shared' });

    await service.startProvisioning('t-shared');

    // Wait for async saga
    await new Promise(r => setTimeout(r, 100));

    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.PREPARING, expect.any(Object));
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.VALIDATING, expect.any(Object));
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.SWITCHING, expect.any(Object));
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.MONITORING, expect.any(Object));
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.FINALIZED, expect.any(Object));

    const status = await service.getStatus('t-shared');
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

    expect(mockDbPort.forkEntityManager).toHaveBeenCalled();
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.FINALIZED, expect.any(Object));
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
    const status = await service.getStatus('t-fail');
    expect(status.status).toBe(ProvisioningStatus.FAILED);
    expect(mockRedis.del).toHaveBeenCalled(); // Lock released
  });
});
