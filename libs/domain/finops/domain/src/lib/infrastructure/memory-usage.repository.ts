import { Injectable } from '@nestjs/common';
import { UsageRecord, UsageRepository } from '../ports/usage.repository';

@Injectable()
export class InMemoryUsageRepository implements UsageRepository {
  private records: UsageRecord[] = [];

  async record(tenantId: string, metric: string, value: number): Promise<void> {
    this.records.push({ tenantId, metric, value, timestamp: new Date() });
  }

  async get(tenantId: string): Promise<UsageRecord[]> {
    return this.records.filter(r => r.tenantId === tenantId);
  }
}
