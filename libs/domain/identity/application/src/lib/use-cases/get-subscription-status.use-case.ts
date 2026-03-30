import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { Tenant } from '@virteex/kernel-tenant';
import { TENANT_REPOSITORY } from '@virteex/domain-identity-domain';
import type { TenantRepository } from '@virteex/domain-identity-domain';

@Injectable()
export class GetSubscriptionStatusUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepository: TenantRepository
  ) {}

  async execute(tenantId: string): Promise<{ status: string; plan: string; billingCycle: string }> {
    const tenant = await this.tenantRepository.findById(tenantId);
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
