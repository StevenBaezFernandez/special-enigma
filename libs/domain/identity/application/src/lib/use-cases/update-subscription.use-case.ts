import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { Tenant } from '@virteex/kernel-tenant';
import { TENANT_REPOSITORY } from '@virteex/domain-identity-domain';
import type { TenantRepository } from '@virteex/domain-identity-domain';

export class UpdateSubscriptionDto {
  plan!: string; // 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'
  billingCycle!: string; // 'MONTHLY', 'ANNUAL'
}

@Injectable()
export class UpdateSubscriptionUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepository: TenantRepository
  ) {}

  async execute(tenantId: string, dto: UpdateSubscriptionDto): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new DomainException('Tenant not found', 'ENTITY_NOT_FOUND');
    }

    tenant.plan = dto.plan;
    tenant.settings = {
      ...tenant.settings,
      billingCycle: dto.billingCycle,
      subscriptionStatus: 'ACTIVE',
      lastBillingUpdate: new Date()
    };

    await this.tenantRepository.save(tenant);
    return tenant;
  }
}
