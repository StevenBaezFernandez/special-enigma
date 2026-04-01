import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY, type SubscriptionRepository, PlanLimitMapper } from '@virteex/domain-subscription-domain';
import { getTenantContext } from '@virteex/kernel-auth';

@Injectable()
export class EntitlementService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository
  ) {}

  async isFeatureEnabled(entitlement: string): Promise<boolean> {
    const context = getTenantContext();
    if (!context?.tenantId) return false;

    const subscription = await this.subscriptionRepository.findByTenantId(context.tenantId);
    if (!subscription || !subscription.isValid()) return false;

    const plan = subscription.getPlan();
    if (!plan) return false;

    // Support capability:action:scope format
    // Simple inclusion check first for backward compatibility and basic features
    if (plan.features.includes(entitlement)) return true;

    // Advanced parsing for capability:action:scope
    const [capability, action, scope] = entitlement.split(':');

    return plan.features.some(f => {
        const [fCap, fAct, fScope] = f.split(':');

        // Capability must match
        if (fCap !== capability) return false;

        // If no action requested or plan has wildcard action
        const actionMatches = !action || fAct === '*' || fAct === action;
        if (!actionMatches) return false;

        // If no scope requested or plan has wildcard scope
        const scopeMatches = !scope || fScope === '*' || fScope === scope;
        return scopeMatches;
    });
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
    const limits = PlanLimitMapper.toStructuredLimits(plan?.limits || []);
    const limit = limits[resource] ?? 0;

    if (limit !== -1 && currentCount >= limit) {
      throw new ForbiddenException(`Quota exceeded for ${resource}. Limit: ${limit}, Current: ${currentCount}`);
    }
  }
}
