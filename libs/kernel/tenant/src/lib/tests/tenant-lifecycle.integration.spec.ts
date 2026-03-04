import { describe, it, expect, beforeEach } from 'vitest';
import { TenantService } from '../tenant.service';
import { Tenant } from '../entities/tenant.entity';
import { TenantControlRecord } from '../entities/tenant-control-record.entity';
import { TenantMode, TenantStatus } from '../interfaces/tenant-config.interface';

function buildServiceHarness() {
  const tenants = new Map<string, Tenant>();
  const controls = new Map<string, TenantControlRecord>();
  const sql: string[] = [];

  const connection = {
    execute: async (query: string, params?: unknown[]) => {
      sql.push(query.trim());
      if (query.includes('information_schema.columns')) {
        return [{ table_name: 'orders' }];
      }
      return params ?? [];
    },
  };

  const em: any = {
    findOne: async (entity: unknown, where: { id?: string }) => {
      if (entity === Tenant && where.id) {
        return tenants.get(where.id) ?? null;
      }
      return null;
    },
    findOneOrFail: async (entity: unknown, where: { tenantId: string }) => {
      if (entity === TenantControlRecord) {
        const value = controls.get(where.tenantId);
        if (!value) throw new Error('not found');
        return value;
      }
      throw new Error('unsupported entity');
    },
    create: (_entity: unknown, payload: any) => ({ ...payload }),
    persistAndFlush: async (entity: any) => {
      if ('tenantId' in entity) {
        controls.set(entity.tenantId, entity);
      } else {
        tenants.set(entity.id, entity);
      }
    },
    flush: async () => undefined,
    getConnection: () => connection,
    fork: () => ({
      getConnection: () => connection,
    }),
    transactional: async (cb: (tx: any) => Promise<void>) => cb({ getConnection: () => connection }),
  };

  const service = new TenantService(em);
  return { service, tenants, controls, sql };
}

const commonInput = {
  primaryRegion: 'us-east-1',
  secondaryRegion: 'sa-east-1',
  complianceProfile: 'soc2',
  keys: {
    kmsKeyId: 'kms-tenant',
    signingKeyId: 'sig-tenant',
  },
};

describe('Tenant lifecycle integration by tenant mode', () => {
  beforeEach(() => {
    process.env['REDIS_URL'] = '';
  });

  it.each([
    {
      mode: TenantMode.SHARED,
      id: 'tenant-shared',
      expectedSql: ['DELETE FROM "orders" WHERE tenant_id = ?'],
    },
    {
      mode: TenantMode.SCHEMA,
      id: 'tenant-schema',
      schemaName: 'tenant_tenant_schema',
      expectedSql: ['DELETE FROM "tenant_tenant_schema"."orders"', 'DROP SCHEMA IF EXISTS "tenant_tenant_schema" CASCADE'],
    },
    {
      mode: TenantMode.DATABASE,
      id: 'tenant-database',
      connectionString: 'postgres://tenant:pw@localhost:5432/tenant_database',
      expectedSql: ['DROP DATABASE IF EXISTS "tenant_database"'],
    },
  ])('creates, activates, suspends and purges %s tenant with persisted states', async (testCase) => {
    const { service, controls, sql } = buildServiceHarness();

    await service.createTenant({
      id: testCase.id,
      mode: testCase.mode,
      schemaName: testCase.schemaName,
      connectionString: testCase.connectionString,
      ...commonInput,
    });

    const controlAfterCreate = controls.get(testCase.id);
    expect(controlAfterCreate).toMatchObject({
      mode: testCase.mode,
      primaryRegion: commonInput.primaryRegion,
      secondaryRegion: commonInput.secondaryRegion,
      complianceProfile: commonInput.complianceProfile,
      status: TenantStatus.PROVISIONING,
      version: 1,
    });

    await service.activateTenant(testCase.id);
    expect(controls.get(testCase.id)?.status).toBe(TenantStatus.ACTIVE);

    await service.suspendTenant(testCase.id);
    expect(controls.get(testCase.id)?.status).toBe(TenantStatus.SUSPENDED);

    await service.terminateTenant(testCase.id);
    expect(controls.get(testCase.id)?.status).toBe(TenantStatus.ARCHIVED);
    expect(controls.get(testCase.id)?.isFrozen).toBe(true);

    await service.purgeTenant(testCase.id);
    expect(controls.get(testCase.id)?.status).toBe(TenantStatus.PURGED);

    for (const expected of testCase.expectedSql) {
      expect(sql.some((statement) => statement.includes(expected))).toBe(true);
    }
  });
});
