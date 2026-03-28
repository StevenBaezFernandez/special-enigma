import { Injectable } from '@nestjs/common';
import { TenantConfigRepository, TenantConfig } from '@virteex/domain-admin-domain';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { OrmTenantConfig } from '../entities/tenant-config.entity';

@Injectable()
export class MikroOrmTenantConfigRepository implements TenantConfigRepository {
  constructor(
    @InjectRepository(OrmTenantConfig)
    private readonly repository: EntityRepository<OrmTenantConfig>
  ) {}

  async save(config: TenantConfig): Promise<void> {
    let ormConfig = await this.repository.findOne({ id: config.id });
    if (!ormConfig) {
      ormConfig = new OrmTenantConfig();
      ormConfig.id = config.id;
    }
    ormConfig.tenantId = config.tenantId;
    ormConfig.key = config.key;
    ormConfig.value = config.value;

    await (this.repository as any).getEntityManager().persistAndFlush(ormConfig);
  }

  async findByTenantAndKey(tenantId: string, key: string): Promise<TenantConfig | null> {
    const ormConfig = await this.repository.findOne({ tenantId, key });
    if (!ormConfig) return null;

    const config = new TenantConfig(ormConfig.tenantId, ormConfig.key, ormConfig.value);
    config.id = ormConfig.id;
    return config;
  }
}
