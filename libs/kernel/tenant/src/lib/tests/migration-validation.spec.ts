import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { MigrationOrchestratorService } from '../migration-orchestrator.service';
import { TenantMode, OperationState } from '../interfaces/tenant-config.interface';
import * as fs from 'fs';
import * as path from 'path';

describe('Migration Pipeline Operational Validation', () => {
  let service: MigrationOrchestratorService;
  let mockEm: any;
  let mockGuard: any;
  let mockOpService: any;
  let mockRoutingPlane: any;


  beforeAll(() => {
    process.env['EVIDENCE_SIGNING_SECRET'] = 'test-secret';
  });

  afterAll(() => {
    delete process.env['EVIDENCE_SIGNING_SECRET'];
  });
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
          execute: vi.fn().mockImplementation(async (query: string) => {
            if (query.includes('information_schema.tables')) return [{ table_name: 'users' }];
            if (query.includes('information_schema.columns')) return [{ column_name: 'tenant_id' }];
            return [{ count: '10', checksum: 'a', structural_hash: 'b' }];
          })
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
    vi.spyOn(service as any, 'getStrongTableStats').mockResolvedValue({ users: { count: 10, checksum: 'a', structuralHash: 'b' } });

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
    vi.spyOn(service as any, 'getStrongTableStats').mockResolvedValue({ users: { count: 10, checksum: 'a', structuralHash: 'b' } });

    await service.migrateTenantWithOperation('t-enterprise', 'key-2');

    expect(mockEm.fork).toHaveBeenCalledWith({ connectionString: 'postgresql://db:5432/tenant' });
    expect(mockEm.getMigrator().up).toHaveBeenCalled();
  });

  it('SHOULD fail if pre-migration check fails', async () => {
    mockGuard.preMigrationCheck.mockResolvedValue(false);

    await expect(service.migrateTenantWithOperation('t-fail', 'key-3')).rejects.toThrow(/safety checks failed/);
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.ROLLBACK, expect.any(Object));
  });

  it('SHOULD fail if checksum reconciliation detects data loss', async () => {
    mockEm.findOneOrFail.mockResolvedValue({ id: 't-integrity', mode: TenantMode.SCHEMA, schemaName: 'tenant_t1' });

    // Simulate data loss in post-migration stats
    vi.spyOn(service as any, 'getStrongTableStats')
      .mockResolvedValueOnce({ users: { count: 100, checksum: 'sum1', structuralHash: 'hash1' } }) // Pre
      .mockResolvedValueOnce({ users: { count: 99, checksum: 'sum2', structuralHash: 'hash1' } }); // Post (loss)

    await expect(service.migrateTenantWithOperation('t-integrity', 'key-integrity')).rejects.toThrow(/data-diff detected unauthorized changes or data loss/);
    expect(mockOpService.transitionState).toHaveBeenCalledWith('op-123', OperationState.ROLLBACK, expect.any(Object));
  });

  it('SHOULD fail if replication lag is too high during shadow check', async () => {
    mockEm.findOneOrFail.mockResolvedValue({ id: 't-lag', mode: TenantMode.SCHEMA, schemaName: 'tenant_t1' });
    vi.spyOn(service as any, 'getStrongTableStats').mockResolvedValue({ users: { count: 10, checksum: 'a', structuralHash: 'b' } });

    // Mock lag result
    mockEm.getConnection().execute.mockImplementation(async (query: string) => {
       if (query.includes('pg_last_xact_replay_timestamp')) return [{ lag: 10 }];
       if (query.includes('information_schema.tables')) return [{ table_name: 'users' }];
       if (query.includes('information_schema.columns')) return [{ column_name: 'tenant_id' }];
       return [{ count: 10, checksum: 'a', structural_hash: 'b' }];
    });

    await expect(service.migrateTenantWithOperation('t-lag', 'key-lag')).rejects.toThrow(/unacceptable replication lag/);
  });
});
