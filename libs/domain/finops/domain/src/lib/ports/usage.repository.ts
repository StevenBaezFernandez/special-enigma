export const USAGE_REPOSITORY = 'USAGE_REPOSITORY';

export interface UsageRecord {
  idempotencyKey?: string;
  tenantId: string;
  metric: 'compute' | 'storage' | 'network' | 'requests';
  value: number;
  timestamp: Date;
  source: string;
}

export interface UsageRepository {
  recordUsage(record: UsageRecord): Promise<void>;
  getUsage(tenantId: string, startDate?: Date, endDate?: Date): Promise<UsageRecord[]>;
  aggregateUsage(tenantId: string, startDate: Date, endDate: Date): Promise<any>;
}
