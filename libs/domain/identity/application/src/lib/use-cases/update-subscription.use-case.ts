import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { Tenant } from '@virteex/kernel-tenant';

export class UpdateSubscriptionDto {
  plan!: string; // 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'
  billingCycle!: string; // 'MONTHLY', 'ANNUAL'
}

@Injectable()
export class UpdateSubscriptionUseCase {
  constructor(private readonly em: EntityManager) {}

  async execute(tenantId: string, dto: UpdateSubscriptionDto): Promise<Tenant> {
    const tenant = await this.em.findOne(Tenant, { id: tenantId });
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

    await this.em.persistAndFlush(tenant);
    return tenant;
  }
}
