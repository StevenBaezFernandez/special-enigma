import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TenantConfigRepository, TENANT_CONFIG_REPOSITORY } from '@virteex/fiscal-domain';

@Injectable()
export class GetTaxRateUseCase {
  constructor(
    @Inject(TENANT_CONFIG_REPOSITORY) private readonly tenantConfigRepo: TenantConfigRepository
  ) {}

  async execute(tenantId: string): Promise<number> {
    const config = await this.tenantConfigRepo.getFiscalConfig(tenantId);

    // Logic for tax rate
    // In future, this should be a strategy or service
    switch (config.country?.toUpperCase()) {
      case 'MX':
      case 'MEXICO':
        return 0.16;
      case 'US':
      case 'USA':
        return 0.08; // Example average sales tax
      default:
        return 0.0;
    }
  }
}
