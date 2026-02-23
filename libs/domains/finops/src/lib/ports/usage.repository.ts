export interface UsageRecord {
  tenantId: string;
  metric: 'compute' | 'storage' | 'database' | 'network';
  value: number; // e.g., hours, GB, etc.
  timestamp: Date;
}

export const USAGE_REPOSITORY = 'USAGE_REPOSITORY';

export interface UsageRepository {
  getUsage(tenantId: string, startDate: Date, endDate: Date): Promise<UsageRecord[]>;
  recordUsage(record: UsageRecord): Promise<void>;
}
