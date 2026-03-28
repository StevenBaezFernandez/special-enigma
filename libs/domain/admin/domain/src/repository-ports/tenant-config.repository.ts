import { TenantConfig } from '../entities/tenant-config.entity';

export const TENANT_CONFIG_REPOSITORY = 'TENANT_CONFIG_REPOSITORY';

export interface TenantConfigRepository {
  save(config: TenantConfig): Promise<void>;
  findByTenantAndKey(tenantId: string, key: string): Promise<TenantConfig | null>;
}
