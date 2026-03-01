import { USAGE_REPOSITORY, UsageRecord, UsageRepository } from './ports/usage.repository';

export class FinOpsService {
  constructor(private readonly repository: UsageRepository) {}

  async trackUsage(tenantId: string, metric: UsageRecord['metric'], value: number, idempotencyKey?: string): Promise<void> {
    await this.repository.recordUsage({
      idempotencyKey,
      tenantId,
      metric,
      value,
      timestamp: new Date(),
      source: 'runtime-metering'
    });
  }

  async getUsage(tenantId: string, startDate?: Date, endDate?: Date): Promise<UsageRecord[]> {
    return this.repository.getUsage(tenantId, startDate, endDate);
  }

  async getUsageSummary(tenantId: string, startDate: Date, endDate: Date) {
    return this.repository.aggregateUsage(tenantId, startDate, endDate);
  }
}
