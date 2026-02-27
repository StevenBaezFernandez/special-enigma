import { afterEach, describe, expect, it } from 'vitest';
import { rmSync } from 'node:fs';
import { SqliteUsageRepository } from './sqlite-usage.repository';

describe('SqliteUsageRepository', () => {
  const dbPath = 'tmp/finops-test/usage.db';

  afterEach(() => {
    rmSync('tmp/finops-test', { recursive: true, force: true });
  });

  it('persists usage and enforces idempotency keys', async () => {
    const config = { get: (k: string) => (k === 'FINOPS_DB_PATH' ? dbPath : undefined) } as any;
    const repo = new SqliteUsageRepository(config);

    await repo.recordUsage({
      idempotencyKey: 'evt-1',
      tenantId: 't1',
      metric: 'compute',
      value: 2,
      timestamp: new Date('2025-01-01T00:00:00.000Z')
    });

    await repo.recordUsage({
      idempotencyKey: 'evt-1',
      tenantId: 't1',
      metric: 'compute',
      value: 999,
      timestamp: new Date('2025-01-01T00:00:00.000Z')
    });

    const rows = await repo.getUsage('t1');
    expect(rows).toHaveLength(1);
    expect(rows[0].value).toBe(2);
  });
});
