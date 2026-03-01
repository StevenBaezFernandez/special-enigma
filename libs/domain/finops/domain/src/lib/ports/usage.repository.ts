export interface UsageRecord {
  idempotencyKey?: string;
  tenantId: string;
  metric: 'compute' | 'storage' | 'database' | 'network';
  value: number;
  timestamp: Date;
  source?: string;
}

export interface UsageAggregate {
  metric: UsageRecord['metric'];
  total: number;
}

export const USAGE_REPOSITORY = 'USAGE_REPOSITORY';

export interface UsageRepository {
  getUsage(tenantId: string, startDate?: Date, endDate?: Date): Promise<UsageRecord[]>;
  recordUsage(record: UsageRecord): Promise<void>;
  aggregateUsage(tenantId: string, startDate: Date, endDate: Date): Promise<UsageAggregate[]>;
}
