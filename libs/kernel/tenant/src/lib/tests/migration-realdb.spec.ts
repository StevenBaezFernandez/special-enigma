import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { execSync } from 'node:child_process';
import { Client } from 'pg';
import { MigrationOrchestratorService } from '../migration-orchestrator.service';
import { TenantMode, OperationState } from '../interfaces/tenant-config.interface';

type TenantRecord = {
  id: string;
  mode: TenantMode;
  schemaName?: string;
  connectionString?: string;
};

class PostgresTestcontainer {
  constructor(
    private readonly name: string,
    private readonly hostPort: number,
    private readonly dbName: string
  ) {}

  start() {
    execSync(`docker rm -f ${this.name} >/dev/null 2>&1 || true`);
    execSync(
      `docker run -d --name ${this.name} -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=${this.dbName} -p ${this.hostPort}:5432 postgres:16-alpine`,
      { stdio: 'ignore' }
    );

    for (let i = 0; i < 45; i += 1) {
      try {
        execSync(`docker exec ${this.name} pg_isready -U postgres -d ${this.dbName}`, { stdio: 'ignore' });
        return;
      } catch {
        execSync('sleep 1');
      }
    }
    throw new Error(`Container ${this.name} did not become healthy.`);
  }

  stop() {
    execSync(`docker rm -f ${this.name} >/dev/null 2>&1 || true`);
  }
}

function toPgQuery(sql: string, params: unknown[]) {
  let idx = 0;
  const text = sql.replace(/\?/g, () => `$${++idx}`);
  return { text, values: params };
}

function buildEntityManager(client: Client, tenants: Record<string, TenantRecord>, dbEm?: any) {
  const execute = async (query: string, params: unknown[] = []) => {
    const parsed = toPgQuery(query, params);
    const res = await client.query(parsed.text, parsed.values);
    return res.rows;
  };

  return {
    findOneOrFail: vi.fn(async (_entity: unknown, criteria: { id: string }) => {
      const tenant = tenants[criteria.id];
      if (!tenant) throw new Error(`Tenant ${criteria.id} not found`);
      return tenant;
    }),
    getConnection: vi.fn(() => ({ execute })),
    getMigrator: vi.fn(() => ({
      getPendingMigrations: vi.fn().mockResolvedValue([]),
      up: vi.fn().mockResolvedValue(undefined),
      down: vi.fn().mockResolvedValue(undefined),
    })),
    fork: vi.fn(({ connectionString }: { connectionString: string }) => {
      if (!dbEm || !connectionString) {
        throw new Error('No dedicated DATABASE EntityManager configured.');
      }
      return dbEm;
    }),
  };
}

async function seedSharedDataset(client: Client) {
  await client.query('CREATE TABLE IF NOT EXISTS public.orders_shared (tenant_id text NOT NULL, order_number text NOT NULL, payload jsonb, created_on timestamp default now())');
  await client.query('TRUNCATE public.orders_shared');
  await client.query(
    `INSERT INTO public.orders_shared (tenant_id, order_number, payload)
     VALUES ('tenant-shared-schema', 'SO-100', '{"currency":"USD","lines":2}'),
            ('tenant-shared-schema', 'SO-101', '{"currency":"MXN","lines":3}'),
            ('tenant-shared-db', 'SO-900', '{"currency":"BRL","lines":7}')`
  );

  await client.query('CREATE TABLE IF NOT EXISTS public.ledger_shared (tenant_id text NOT NULL, journal_ref text NOT NULL, balance numeric, metadata jsonb)');
  await client.query('TRUNCATE public.ledger_shared');
  await client.query(
    `INSERT INTO public.ledger_shared (tenant_id, journal_ref, balance, metadata)
     VALUES ('tenant-shared-schema', 'JR-1', 10.5, '{"source":"migration-suite"}'),
            ('tenant-shared-schema', 'JR-2', 42.0, '{"source":"migration-suite"}'),
            ('tenant-shared-db', 'JR-9', 100.0, '{"source":"migration-suite"}')`
  );
}

async function seedSchemaDataset(client: Client) {
  await client.query('CREATE SCHEMA IF NOT EXISTS tenant_schema_only');
  await client.query('CREATE TABLE IF NOT EXISTS tenant_schema_only.invoice_log (invoice_uuid text NOT NULL, status text NOT NULL, stamped_at timestamp)');
  await client.query('TRUNCATE tenant_schema_only.invoice_log');
  await client.query(
    `INSERT INTO tenant_schema_only.invoice_log (invoice_uuid, status, stamped_at)
     VALUES ('inv-1','stamped',now()), ('inv-2','pending',now())`
  );

  await client.query('CREATE TABLE IF NOT EXISTS tenant_schema_only.audit_slice (actor text NOT NULL, event_type text NOT NULL, occurred_at timestamp default now())');
  await client.query('TRUNCATE tenant_schema_only.audit_slice');
  await client.query(`INSERT INTO tenant_schema_only.audit_slice (actor, event_type) VALUES ('bot','created'),('bot','updated')`);
}

async function seedDatabaseDataset(client: Client) {
  await client.query('CREATE TABLE IF NOT EXISTS public.orders_dedicated (tenant_id text NOT NULL, item_code text NOT NULL, quantity integer NOT NULL, context jsonb)');
  await client.query('TRUNCATE public.orders_dedicated');
  await client.query(
    `INSERT INTO public.orders_dedicated (tenant_id, item_code, quantity, context)
     VALUES ('tenant-schema-db', 'SKU-1', 1, '{"region":"us-east-1"}'),
            ('tenant-shared-db', 'SKU-2', 2, '{"region":"sa-east-1"}')`
  );
}

describe('Migration real DB suite (testcontainer-backed)', () => {
  const sharedTc = new PostgresTestcontainer('virteex-shared-migration-tc', 55432, 'virteex');
  const dedicatedTc = new PostgresTestcontainer('virteex-dedicated-migration-tc', 55433, 'tenantdb');
  let sharedClient: Client;
  let dedicatedClient: Client;
  let dockerAvailable = true;

  beforeAll(async () => {
    process.env['EVIDENCE_SIGNING_SECRET'] = 'migration-suite-secret';
    try {
      execSync('docker --version', { stdio: 'ignore' });
    } catch {
      dockerAvailable = false;
      return;
    }

    sharedTc.start();
    dedicatedTc.start();

    sharedClient = new Client({ host: '127.0.0.1', port: 55432, database: 'virteex', user: 'postgres', password: 'postgres' });
    dedicatedClient = new Client({ host: '127.0.0.1', port: 55433, database: 'tenantdb', user: 'postgres', password: 'postgres' });

    await sharedClient.connect();
    await dedicatedClient.connect();
  }, 120000);

  afterAll(async () => {
    if (!dockerAvailable) return;
    await sharedClient?.end();
    await dedicatedClient?.end();
    sharedTc.stop();
    dedicatedTc.stop();
  });

  beforeEach(async () => {
    if (!dockerAvailable) return;
    await seedSharedDataset(sharedClient);
    await seedSchemaDataset(sharedClient);
    await seedDatabaseDataset(dedicatedClient);
  });

  it('executes shared→schema route with signed checksum manifest', async () => {
    if (!dockerAvailable) return;

    const tenants = {
      'tenant-shared-schema': { id: 'tenant-shared-schema', mode: TenantMode.SCHEMA, schemaName: 'tenant_schema_only' },
    };

    const em = buildEntityManager(sharedClient, tenants);
    const transitions: unknown[] = [];
    const opService = {
      acquireLock: vi.fn().mockResolvedValue(true),
      releaseLock: vi.fn().mockResolvedValue(undefined),
      createOperation: vi.fn().mockResolvedValue({ operationId: 'op-shared-schema', state: 'requested', startedAt: new Date() }),
      transitionState: vi.fn().mockImplementation(async (...args) => {
        transitions.push(args);
      }),
    };

    const service = new MigrationOrchestratorService(
      em as any,
      { preMigrationCheck: vi.fn().mockResolvedValue(true) } as any,
      opService as any,
      { resolveRoute: vi.fn().mockResolvedValue({ version: 1 }), createSnapshot: vi.fn().mockResolvedValue(undefined) } as any
    );

    await service.migrateTenantWithOperation('tenant-shared-schema', 'idem-shared-schema');

    const finalized = transitions.find((transition: any) => transition[1] === OperationState.FINALIZED);
    expect(finalized).toBeTruthy();
    expect(String((finalized as any)[3] || '')).toContain('checksum-manifest.json');
  }, 120000);

  it('executes schema→database route over dedicated connection', async () => {
    if (!dockerAvailable) return;

    const dedicatedConnectionString = 'postgresql://postgres:postgres@127.0.0.1:55433/tenantdb';
    const tenants = {
      'tenant-schema-db': { id: 'tenant-schema-db', mode: TenantMode.DATABASE, connectionString: dedicatedConnectionString },
    };

    const dedicatedEm = buildEntityManager(dedicatedClient, tenants);
    const em = buildEntityManager(sharedClient, tenants, dedicatedEm);

    const opService = {
      acquireLock: vi.fn().mockResolvedValue(true),
      releaseLock: vi.fn().mockResolvedValue(undefined),
      createOperation: vi.fn().mockResolvedValue({ operationId: 'op-schema-db', state: 'requested', startedAt: new Date() }),
      transitionState: vi.fn().mockResolvedValue(undefined),
    };

    const service = new MigrationOrchestratorService(
      em as any,
      { preMigrationCheck: vi.fn().mockResolvedValue(true) } as any,
      opService as any,
      { resolveRoute: vi.fn().mockResolvedValue({ version: 2 }), createSnapshot: vi.fn().mockResolvedValue(undefined) } as any
    );

    await service.migrateTenantWithOperation('tenant-schema-db', 'idem-schema-db');
    expect((em as any).fork).toHaveBeenCalled();
  }, 120000);

  it('executes shared→database route for heterogeneous tables without universal id/updated_at', async () => {
    if (!dockerAvailable) return;

    const dedicatedConnectionString = 'postgresql://postgres:postgres@127.0.0.1:55433/tenantdb';
    const tenants = {
      'tenant-shared-db': { id: 'tenant-shared-db', mode: TenantMode.DATABASE, connectionString: dedicatedConnectionString },
    };

    const dedicatedEm = buildEntityManager(dedicatedClient, tenants);
    const em = buildEntityManager(sharedClient, tenants, dedicatedEm);

    const opService = {
      acquireLock: vi.fn().mockResolvedValue(true),
      releaseLock: vi.fn().mockResolvedValue(undefined),
      createOperation: vi.fn().mockResolvedValue({ operationId: 'op-shared-db', state: 'requested', startedAt: new Date() }),
      transitionState: vi.fn().mockResolvedValue(undefined),
    };

    const service = new MigrationOrchestratorService(
      em as any,
      { preMigrationCheck: vi.fn().mockResolvedValue(true) } as any,
      opService as any,
      { resolveRoute: vi.fn().mockResolvedValue({ version: 4 }), createSnapshot: vi.fn().mockResolvedValue(undefined) } as any
    );

    await expect(service.migrateTenantWithOperation('tenant-shared-db', 'idem-shared-db')).resolves.not.toThrow();
  }, 120000);
});
