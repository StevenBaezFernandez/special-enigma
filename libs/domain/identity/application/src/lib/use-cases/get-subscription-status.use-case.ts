import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { Tenant } from '@virteex/kernel-tenant';

@Injectable()
export class GetSubscriptionStatusUseCase {
  constructor(private readonly em: EntityManager) {}

  async execute(tenantId: string): Promise<{ status: string; plan: string; billingCycle: string }> {
    const tenant = await this.em.findOne(Tenant, { id: tenantId });
    if (!tenant) {
      throw new DomainException('Tenant not found', 'ENTITY_NOT_FOUND');
    }

    return {
      status: (tenant.settings as any)?.['subscriptionStatus'] || 'INACTIVE',
      plan: tenant.plan || 'TRIAL',
      billingCycle: (tenant.settings as any)?.['billingCycle'] || 'MONTHLY'
    };
  }
}
