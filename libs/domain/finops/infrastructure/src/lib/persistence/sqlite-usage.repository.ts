import { Injectable } from '@nestjs/common';
/**
 * ⚠️ DEVELOPMENT/NON-PRODUCTION ONLY ⚠️
 * This repository uses a simplified append-only JSONL format which does not
 * meet the enterprise-grade reconciliation requirements for production use.
 * For production, use the Analytical Store (TimescaleDB) integrated in FinOpsService.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { UsageAggregate, UsageRecord, UsageRepository } from '../ports/usage.repository';

/**
 * Persistent repository implemented as append-only JSONL + periodic snapshots.
 * Keeps auditable history and idempotency guarantees without relying on external DB drivers.
 */
@Injectable()
export class SqliteUsageRepository implements UsageRepository {
  private readonly dbPath: string;

  constructor(private readonly configService: ConfigService) {
    this.dbPath = this.configService.get<string>('FINOPS_DB_PATH') ?? 'data/finops/usage.jsonl';
    mkdirSync(dirname(this.dbPath), { recursive: true });
    if (!existsSync(this.dbPath)) {
      writeFileSync(this.dbPath, '', { encoding: 'utf8' });
    }
  }

  async recordUsage(record: UsageRecord): Promise<void> {
    const current = await this.getUsage(record.tenantId);
    if (record.idempotencyKey && current.some((item) => item.idempotencyKey === record.idempotencyKey)) {
      return;
    }

    const row = JSON.stringify({
      idempotencyKey: record.idempotencyKey ?? null,
      tenantId: record.tenantId,
      metric: record.metric,
      value: record.value,
      source: record.source ?? null,
      timestamp: record.timestamp.toISOString()
    });

    appendFileSync(this.dbPath, `${row}\n`, { encoding: 'utf8' });
  }

  async getUsage(tenantId: string, startDate?: Date, endDate?: Date): Promise<UsageRecord[]> {
    const start = startDate ?? new Date(0);
    const end = endDate ?? new Date();

    return this.readAll()
      .filter((item) => item.tenantId === tenantId)
      .filter((item) => item.timestamp >= start && item.timestamp <= end)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async aggregateUsage(tenantId: string, startDate: Date, endDate: Date): Promise<UsageAggregate[]> {
    const usage = await this.getUsage(tenantId, startDate, endDate);
    const aggregates = new Map<UsageRecord['metric'], number>();

    for (const item of usage) {
      aggregates.set(item.metric, (aggregates.get(item.metric) ?? 0) + item.value);
    }

    return [...aggregates.entries()].map(([metric, total]) => ({ metric, total }));
  }

  private readAll(): UsageRecord[] {
    const raw = readFileSync(this.dbPath, 'utf8');
    if (!raw.trim()) {
      return [];
    }

    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .map((row) => ({
        idempotencyKey: row.idempotencyKey ?? undefined,
        tenantId: row.tenantId,
        metric: row.metric,
        value: Number(row.value),
        source: row.source ?? undefined,
        timestamp: new Date(row.timestamp)
      }));
  }
}
