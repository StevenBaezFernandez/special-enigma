import { Injectable } from '@nestjs/common';
import { TenantConfigRepository, TenantConfig } from '@virteex/domain-admin-domain';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class MikroOrmTenantConfigRepository implements TenantConfigRepository {
  constructor(
    @InjectRepository(TenantConfig)
    private readonly repository: EntityRepository<TenantConfig>
  ) {}

  async save(config: TenantConfig): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(config);
  }

  async findByTenantAndKey(tenantId: string, key: string): Promise<TenantConfig | null> {
    return this.repository.findOne({ tenantId, key });
  }
}
