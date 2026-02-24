import { Injectable, Inject } from '@nestjs/common';
import { TenantConfig, TenantConfigRepository, TENANT_CONFIG_REPOSITORY } from '@virteex/domain-admin-domain';

export class UpdateConfigDto {
  tenantId!: string;
  key!: string;
  value!: string;
}

@Injectable()
export class UpdateConfigUseCase {
  constructor(
    @Inject(TENANT_CONFIG_REPOSITORY) private readonly repository: TenantConfigRepository
  ) {}

  async execute(dto: UpdateConfigDto): Promise<TenantConfig> {
    let config = await this.repository.findByTenantAndKey(dto.tenantId, dto.key);
    if (!config) {
      config = new TenantConfig(dto.tenantId, dto.key, dto.value);
    } else {
      config.value = dto.value;
    }
    await this.repository.save(config);
    return config;
  }
}
