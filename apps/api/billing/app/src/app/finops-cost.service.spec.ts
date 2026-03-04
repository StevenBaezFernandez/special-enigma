import { mkdtemp, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { FinopsCostService } from './finops-cost.service';

describe('FinopsCostService', () => {
  it('ingests CUR costs, reconciles by tenant-region-mode and blocks optimization claim when thresholds fail', async () => {
    const fixtureDir = await mkdtemp(join(tmpdir(), 'finops-'));
    const curPath = join(fixtureDir, 'cur.csv');
    const internalPath = join(fixtureDir, 'internal.json');

    await writeFile(
      curPath,
      [
        'usage_start,tenant_id,region,tenant_mode,cost_usd,line_item_id',
        '2026-03-01T00:00:00Z,t-1,us-east-1,SCHEMA,100,line-1',
        '2026-03-01T00:00:00Z,t-2,sa-east-1,SHARED,50,line-2',
      ].join('\n'),
      'utf8',
    );

    await writeFile(
      internalPath,
      JSON.stringify([
        {
          timestamp: '2026-03-01T00:00:00Z',
          tenantId: 't-1',
          region: 'us-east-1',
          tenantMode: 'SCHEMA',
          expectedCostUsd: 70,
        },
        {
          timestamp: '2026-03-01T00:00:00Z',
          tenantId: 't-2',
          region: 'sa-east-1',
          tenantMode: 'SHARED',
          expectedCostUsd: 49,
        },
      ]),
      'utf8',
    );

    const config = {
      get: (key: string) =>
        (
          {
            CLOUD_COST_CUR_PATH: curPath,
            FINOPS_INTERNAL_COST_PATH: internalPath,
            FINOPS_DRIFT_WARN_THRESHOLD: '0.05',
            FINOPS_DRIFT_BLOCK_THRESHOLD: '0.1',
            FINOPS_MIN_RECONCILED_SERIES: '2',
          } as Record<string, string>
        )[key],
    };

    const service = new FinopsCostService(config as any);
    const summary = await service.buildOpsSummary();

    expect(summary.ingestion.records).toBe(2);
    expect(summary.reconciliation.operationalActions.openIncidentForBlockingDrift.length).toBe(1);
    expect(summary.commercialClaimEligibility.eligible).toBe(false);
  });

  it('approves claims with enough reconciled history and no blocking drift', () => {
    const service = new FinopsCostService({ get: () => undefined } as any);

    const result = service.evaluateClaimEligibility(35, [
      {
        key: 'a',
        tenantId: 't-1',
        region: 'us-east-1',
        tenantMode: 'SCHEMA',
        cloudCostUsd: 100,
        expectedCostUsd: 100,
        driftRatio: 0,
        status: 'ok',
      },
    ]);

    expect(result.eligible).toBe(true);
  });
});
