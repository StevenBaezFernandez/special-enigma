import { Injectable, Inject } from '@nestjs/common';
import { USAGE_REPOSITORY, UsageRepository } from './ports/usage.repository';

@Injectable()
export class FinOpsService {
  constructor(
    @Inject(USAGE_REPOSITORY) private readonly repository: UsageRepository
  ) {}

  async trackUsage(tenantId: string, metric: string, value: number): Promise<void> {
    await this.repository.record(tenantId, metric, value);
  }

  async getUsage(tenantId: string): Promise<any[]> {
    return this.repository.get(tenantId);
  }
}
