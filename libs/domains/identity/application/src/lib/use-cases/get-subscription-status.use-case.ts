import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Tenant } from '@virteex/tenant';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class GetSubscriptionStatusUseCase {
  constructor(private readonly em: EntityManager) {}

  async execute(tenantId: string): Promise<{ status: string; plan: string; billingCycle: string }> {
    const tenant = await this.em.findOne(Tenant, { id: tenantId });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      status: (tenant.settings as any)?.['subscriptionStatus'] || 'INACTIVE',
      plan: tenant.plan || 'TRIAL',
      billingCycle: (tenant.settings as any)?.['billingCycle'] || 'MONTHLY'
    };
  }
}
