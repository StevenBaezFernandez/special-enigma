import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY, type SubscriptionRepository } from '@virteex/domain-subscription-domain';
import { getTenantContext } from '@virteex/kernel-auth';

@Injectable()
export class EntitlementService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository
  ) {}

  async isFeatureEnabled(feature: string): Promise<boolean> {
    const context = getTenantContext();
    if (!context?.tenantId) return false;

    const subscription = await this.subscriptionRepository.findByTenantId(context.tenantId);
    if (!subscription || !subscription.isValid()) return false;

    const plan = subscription.getPlan();
    return plan?.features.includes(feature) ?? false;
  }

  async checkQuota(resource: string, currentCount: number): Promise<void> {
    const context = getTenantContext();
    if (!context?.tenantId) {
      throw new ForbiddenException('Tenant context required for quota check');
    }

    const subscription = await this.subscriptionRepository.findByTenantId(context.tenantId);
    if (!subscription || !subscription.isValid()) {
       throw new ForbiddenException('No active subscription found for quota check');
    }

    const plan = subscription.getPlan();
    const limitObj = plan?.limits?.find(l => l.resource === resource);
    const limit = limitObj ? limitObj.limit : 0;

    if (limit !== -1 && currentCount >= limit) {
      throw new ForbiddenException(`Quota exceeded for ${resource}. Limit: ${limit}, Current: ${currentCount}`);
    }
  }
}
