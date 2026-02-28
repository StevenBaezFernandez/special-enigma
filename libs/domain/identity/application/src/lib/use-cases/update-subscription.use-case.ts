import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Tenant } from '@virteex/kernel-tenant';
import { EntityManager } from '@mikro-orm/core';

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
      throw new NotFoundException('Tenant not found');
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
