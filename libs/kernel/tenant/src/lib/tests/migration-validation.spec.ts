import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MigrationOrchestratorService } from '../migration-orchestrator.service';
import { TenantMode, OperationState } from '../interfaces/tenant-config.interface';

describe('Migration Pipeline Operational Validation', () => {
  let service: MigrationOrchestratorService;
  let mockEm: any;
  let mockOpService: any;

  beforeEach(() => {
    mockEm = {
      findOneOrFail: vi.fn(),
      findOne: vi.fn(),
      getMigrator: vi.fn().mockReturnValue({
        up: vi.fn().mockResolvedValue(undefined),
        down: vi.fn().mockResolvedValue(undefined),
        getPendingMigrations: vi.fn().mockResolvedValue([])
      }),
      fork: vi.fn().mockReturnThis(),
      getConnection: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue([])
      }),
      getKnex: vi.fn().mockReturnValue(
          Object.assign(
            vi.fn().mockReturnValue({
                where: vi.fn().mockReturnThis(),
                first: vi.fn().mockResolvedValue({ status: 'COMPLETED' })
            }),
            {
                raw: vi.fn().mockResolvedValue({ rows: [{ lag_ms: 0, size: '1000' }] })
            }
          )
      )
    };
    mockOpService = {
      createOperation: vi.fn().mockResolvedValue({ operationId: 'mig-123' }),
      transitionState: vi.fn().mockResolvedValue(undefined),
    };
    service = new MigrationOrchestratorService(mockEm as any, mockOpService as any);
  });

  it('SHOULD execute Shared -> Schema migration with integrity checks', async () => {
    mockEm.findOneOrFail.mockResolvedValue({ id: 't1', mode: TenantMode.SCHEMA, schemaName: 'tenant_t1' });

    await service.migrateTenantWithOperation('t1', 'key-1');

    expect(mockOpService.transitionState).toHaveBeenCalledWith('mig-123', OperationState.PREPARING);
    expect(mockOpService.transitionState).toHaveBeenCalledWith('mig-123', OperationState.VALIDATING);
    expect(mockOpService.transitionState).toHaveBeenCalledWith('mig-123', OperationState.SWITCHED);

    const migrator = mockEm.getMigrator();
    expect(migrator.up).toHaveBeenCalledWith({ schema: 'tenant_t1' });

    expect(mockOpService.transitionState).toHaveBeenCalledWith('mig-123', OperationState.FINALIZED);
  });

  it('SHOULD execute Schema -> DB migration via dedicated connection', async () => {
    mockEm.findOneOrFail.mockResolvedValue({
        id: 't-enterprise',
        mode: TenantMode.DATABASE,
        connectionString: 'postgres://dedicated'
    });

    await service.migrateTenantWithOperation('t-enterprise', 'key-2');

    expect(mockEm.fork).toHaveBeenCalledWith({ connectionString: 'postgres://dedicated' });
    expect(mockOpService.transitionState).toHaveBeenCalledWith('mig-123', OperationState.FINALIZED);
  });

  it('SHOULD trigger rollback on migration failure', async () => {
    mockEm.findOneOrFail.mockResolvedValue({ id: 't-fail', mode: TenantMode.SHARED });
    mockEm.findOne.mockResolvedValue({ id: 't-fail', mode: TenantMode.SHARED });
    mockEm.getMigrator.mockReturnValue({
        up: vi.fn().mockRejectedValue(new Error('Migration Error')),
        down: vi.fn().mockResolvedValue(undefined)
    });

    await expect(service.migrateTenantWithOperation('t-fail', 'key-3')).rejects.toThrow();

    expect(mockOpService.transitionState).toHaveBeenCalledWith('mig-123', OperationState.ROLLBACK, expect.any(Object));
  });
});
