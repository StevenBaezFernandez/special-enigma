import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'node:fs/promises';

export interface CloudCostRecord {
  timestamp: string;
  tenantId: string;
  region: string;
  tenantMode: 'SHARED' | 'SCHEMA' | 'DATABASE';
  costUsd: number;
  sourceRef: string;
}

interface InternalCostRecord {
  timestamp: string;
  tenantId: string;
  region: string;
  tenantMode: 'SHARED' | 'SCHEMA' | 'DATABASE';
  expectedCostUsd: number;
  adoptedRecommendationIds?: string[];
}

interface ReconciliationBucket {
  key: string;
  tenantId: string;
  region: string;
  tenantMode: string;
  cloudCostUsd: number;
  expectedCostUsd: number;
  driftRatio: number;
  status: 'ok' | 'warn' | 'block';
}

@Injectable()
export class FinopsCostService {
  constructor(private readonly configService: ConfigService) {}

  async buildOpsSummary() {
    const cloudRecords = await this.loadCloudCosts();
    const internalRecords = await this.loadInternalExpectedCosts();
    const reconciliation = this.reconcile(cloudRecords, internalRecords);

    const recommendations = this.buildRecommendations(reconciliation.buckets);
    const adoptionEvidence = this.buildAdoptionEvidence(internalRecords, recommendations.map((item) => item.id));

    return {
      ingestion: {
        source: this.configService.get<string>('CLOUD_COST_SOURCE') ?? 'aws-cur-csv',
        records: cloudRecords.length,
        traceabilityDimensions: ['tenantId', 'region', 'tenantMode'],
      },
      reconciliation,
      recommendations,
      adoptionEvidence,
      commercialClaimEligibility: this.evaluateClaimEligibility(reconciliation.reconciledHistoricalPoints, reconciliation.buckets),
    };
  }

  evaluateClaimEligibility(reconciledHistoricalPoints: number, buckets: ReconciliationBucket[]) {
    const minimumSeries = Number(this.configService.get<string>('FINOPS_MIN_RECONCILED_SERIES') ?? '30');
    const hasBlockingDrift = buckets.some((item) => item.status === 'block');

    if (reconciledHistoricalPoints < minimumSeries) {
      return {
        eligible: false,
        reason: `Insufficient reconciled historical series: ${reconciledHistoricalPoints}/${minimumSeries}.`,
      };
    }

    if (hasBlockingDrift) {
      return {
        eligible: false,
        reason: 'Blocking drift detected in reconciled series.',
      };
    }

    return { eligible: true, reason: 'Historical series and drift thresholds are within policy.' };
  }

  private async loadCloudCosts(): Promise<CloudCostRecord[]> {
    const curPath = this.configService.get<string>('CLOUD_COST_CUR_PATH');
    if (!curPath) {
      return [];
    }

    const raw = await readFile(curPath, 'utf8');
    const [headerLine, ...rows] = raw.split(/\r?\n/).filter(Boolean);
    if (!headerLine) {
      return [];
    }

    const header = headerLine.split(',').map((item) => item.trim());
    return rows.map((row) => this.mapCurCsvRow(header, row)).filter((row): row is CloudCostRecord => row !== null);
  }

  private mapCurCsvRow(header: string[], row: string): CloudCostRecord | null {
    const columns = row.split(',').map((item) => item.trim());
    const data = Object.fromEntries(header.map((name, index) => [name, columns[index] ?? '']));

    if (!data.tenant_id || !data.region || !data.tenant_mode || !data.cost_usd || !data.usage_start) {
      return null;
    }

    const tenantMode = String(data.tenant_mode).toUpperCase() as CloudCostRecord['tenantMode'];
    if (!['SHARED', 'SCHEMA', 'DATABASE'].includes(tenantMode)) {
      return null;
    }

    const parsedCost = Number(data.cost_usd);
    if (!Number.isFinite(parsedCost)) {
      return null;
    }

    return {
      timestamp: data.usage_start,
      tenantId: data.tenant_id,
      region: data.region,
      tenantMode,
      costUsd: parsedCost,
      sourceRef: data.line_item_id || `${data.tenant_id}:${data.usage_start}`,
    };
  }

  private async loadInternalExpectedCosts(): Promise<InternalCostRecord[]> {
    const path = this.configService.get<string>('FINOPS_INTERNAL_COST_PATH');
    if (!path) {
      return [];
    }

    const raw = await readFile(path, 'utf8');
    const parsed = JSON.parse(raw) as InternalCostRecord[];
    return parsed.filter((item) => item.tenantId && item.region && item.tenantMode && item.timestamp);
  }

  private reconcile(cloudRecords: CloudCostRecord[], internalRecords: InternalCostRecord[]) {
    const warnThreshold = Number(this.configService.get<string>('FINOPS_DRIFT_WARN_THRESHOLD') ?? '0.05');
    const blockThreshold = Number(this.configService.get<string>('FINOPS_DRIFT_BLOCK_THRESHOLD') ?? '0.1');

    const byKey = new Map<string, { cloudCostUsd: number; expectedCostUsd: number; tenantId: string; region: string; tenantMode: string }>();

    for (const entry of cloudRecords) {
      const key = `${entry.tenantId}|${entry.region}|${entry.tenantMode}|${entry.timestamp.slice(0, 10)}`;
      const bucket = byKey.get(key) ?? { cloudCostUsd: 0, expectedCostUsd: 0, tenantId: entry.tenantId, region: entry.region, tenantMode: entry.tenantMode };
      bucket.cloudCostUsd += entry.costUsd;
      byKey.set(key, bucket);
    }

    for (const entry of internalRecords) {
      const key = `${entry.tenantId}|${entry.region}|${entry.tenantMode}|${entry.timestamp.slice(0, 10)}`;
      const bucket = byKey.get(key) ?? { cloudCostUsd: 0, expectedCostUsd: 0, tenantId: entry.tenantId, region: entry.region, tenantMode: entry.tenantMode };
      bucket.expectedCostUsd += entry.expectedCostUsd;
      byKey.set(key, bucket);
    }

    const buckets: ReconciliationBucket[] = [];
    for (const [key, value] of byKey.entries()) {
      const denominator = Math.max(value.cloudCostUsd, 0.01);
      const driftRatio = Math.abs(value.cloudCostUsd - value.expectedCostUsd) / denominator;
      const status: ReconciliationBucket['status'] = driftRatio > blockThreshold ? 'block' : driftRatio > warnThreshold ? 'warn' : 'ok';
      buckets.push({ key, driftRatio, status, ...value });
    }

    return {
      warnThreshold,
      blockThreshold,
      reconciledHistoricalPoints: buckets.filter((item) => item.status !== 'block' && item.cloudCostUsd > 0 && item.expectedCostUsd > 0).length,
      buckets,
      operationalActions: {
        openIncidentForBlockingDrift: buckets.filter((item) => item.status === 'block').map((item) => item.key),
        requireFinopsReviewForWarnings: buckets.filter((item) => item.status === 'warn').map((item) => item.key),
      },
    };
  }

  private buildRecommendations(buckets: ReconciliationBucket[]) {
    return buckets
      .filter((item) => item.status !== 'ok')
      .map((item) => ({
        id: `rec-${Buffer.from(item.key).toString('base64url').slice(0, 16)}`,
        tenantId: item.tenantId,
        region: item.region,
        tenantMode: item.tenantMode,
        recommendation:
          item.status === 'block'
            ? 'Escalar tenant a revisión FinOps inmediata y congelar claim comercial de optimización.'
            : 'Programar tuning de capacidad y revisar política de autoscaling/caching en la región.',
      }));
  }

  private buildAdoptionEvidence(internalRecords: InternalCostRecord[], recommendationIds: string[]) {
    const adoptedIds = new Set(
      internalRecords.flatMap((record) => record.adoptedRecommendationIds ?? []).filter((id) => recommendationIds.includes(id)),
    );

    return {
      trackedRecommendations: recommendationIds.length,
      adoptedRecommendations: adoptedIds.size,
      adoptionRate: recommendationIds.length > 0 ? adoptedIds.size / recommendationIds.length : 1,
      adoptedRecommendationIds: [...adoptedIds],
    };
  }
}
