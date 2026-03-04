import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { MigrationOrchestratorService } from '../migration-orchestrator.service';
import { TenantMode, OperationState } from '../interfaces/tenant-config.interface';

describe('Migration Pipeline Operational Validation', () => {
  let service: MigrationOrchestratorService;
  let mockEm: any;
  let mockGuard: any;
  let mockOpService: any;
  let mockRoutingPlane: any;

  beforeEach(() => {
    mockEm = {
      findOneOrFail: vi.fn(),
      fork: vi.fn().mockImplementation(() => mockEm),
      getMigrator: vi.fn().mockReturnValue({
        getPendingMigrations: vi.fn().mockResolvedValue([]),
        up: vi.fn().mockResolvedValue(undefined),
        down: vi.fn().mockResolvedValue(undefined),
      }),
      getConnection: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue([{ count: '10' }])
      })
    };
    mockGuard = {
      preMigrationCheck: vi.fn().mockResolvedValue(true),
    };
    mockOpService = {
      createOperation: vi.fn().mockResolvedValue({ operationId: 'op-123' }),
      transitionState: vi.fn().mockResolvedValue(undefined),
      acquireLock: vi.fn().mockResolvedValue(true),
      releaseLock: vi.fn().mockResolvedValue(undefined),
    };
    mockRoutingPlane = {
      resolveRoute: vi.fn().mockResolvedValue({ version: 1 }),
      createSnapshot: vi.fn().mockResolvedValue({}),
    };

    service = new MigrationOrchestratorService(
      mockEm as any,
      mockGuard as any,
      mockOpService as any,
      mockRoutingPlane as any
    );
  });

  it('SHOULD execute Shared -> Schema migration with integrity checks', async () => {
    mockEm.findOneOrFail.mockResolvedValue({ id: 't1', mode: TenantMode.SCHEMA, schemaName: 'tenant_t1' });

    await service.migrateTenantWithOperation('t1', 'key-1');

    expect(mockGuard.preMigrationCheck).toHaveBeenCalled();
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.DRY_RUN, expect.any(Object));
    expect(mockEm.getMigrator().up).toHaveBeenCalledWith({ schema: 'tenant_t1' });
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.RECONCILING, expect.objectContaining({ reconciled: true }));
  });

  it('SHOULD execute Schema -> DB migration via dedicated connection', async () => {
    mockEm.findOneOrFail.mockResolvedValue({
        id: 't-enterprise',
        mode: TenantMode.DATABASE,
        connectionString: 'postgresql://db:5432/tenant'
    });

    await service.migrateTenantWithOperation('t-enterprise', 'key-2');

    expect(mockEm.fork).toHaveBeenCalledWith({ connectionString: 'postgresql://db:5432/tenant' });
    expect(mockEm.getMigrator().up).toHaveBeenCalled();
  });

  it('SHOULD fail if pre-migration check fails', async () => {
    mockGuard.preMigrationCheck.mockResolvedValue(false);

    await expect(service.migrateTenantWithOperation('t-fail', 'key-3')).rejects.toThrow(/safety checks failed/);
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.ROLLBACK, expect.any(Object));
  });
});
