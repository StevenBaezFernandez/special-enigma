import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MigrationOrchestratorService } from '../migration-orchestrator.service';
import { TenantMode } from '../interfaces/tenant-config.interface';

describe('Migration Pipeline Operational Validation', () => {
  let service: MigrationOrchestratorService;
  let mockEm: any;
  let mockGuard: any;

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
    mockGuard = {
      preMigrationCheck: vi.fn().mockResolvedValue(true),
    };
    service = new MigrationOrchestratorService(mockEm as any, mockGuard as any);
  });

  it('SHOULD execute Shared -> Schema migration with integrity checks', async () => {
    mockEm.findOneOrFail.mockResolvedValue({ id: 't1', mode: TenantMode.SCHEMA, schemaName: 'tenant_t1' });

    await service.migrateTenantWithOperation('t1', 'key-1');

    expect(mockGuard.preMigrationCheck).toHaveBeenCalled();
    expect(mockEm.getMigrator).toHaveBeenCalled();
  });

  it('SHOULD execute Schema -> DB migration via dedicated connection', async () => {
    mockEm.findOneOrFail.mockResolvedValue({
        id: 't-enterprise',
        mode: TenantMode.DATABASE,
        connectionString: 'postgres://dedicated'
    });

    await service.migrateTenantWithOperation('t-enterprise', 'key-2');

    expect(mockEm.fork).toHaveBeenCalledWith({ connectionString: 'postgres://dedicated' });
  });

  it('SHOULD fail if pre-migration check fails', async () => {
    mockGuard.preMigrationCheck.mockResolvedValue(false);
    mockEm.findOneOrFail.mockResolvedValue({ id: 't-fail', mode: TenantMode.SHARED });

    await expect(service.migrateTenantWithOperation('t-fail', 'key-3')).rejects.toThrow(/safety checks failed/);
  });
});
