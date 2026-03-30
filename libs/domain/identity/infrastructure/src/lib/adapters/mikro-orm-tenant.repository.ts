import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import type { TenantRepository } from '@virteex/domain-identity-domain';
import { Tenant } from '@virteex/kernel-tenant';

@Injectable()
export class MikroOrmTenantRepository implements TenantRepository {
  constructor(private readonly em: EntityManager) {}

  findById(id: string): Promise<Tenant | null> {
    return this.em.findOne(Tenant, { id });
  }

  async save(tenant: Tenant): Promise<void> {
    await this.em.upsert(Tenant, tenant);
    await this.em.flush();
  }
}
