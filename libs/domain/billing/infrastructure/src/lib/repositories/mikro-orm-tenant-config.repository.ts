import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Company } from '@virteex/domain-identity-domain';
import { type TenantConfigRepository, type TenantFiscalConfig } from '@virteex/domain-billing-domain';

@Injectable()
export class MikroOrmTenantConfigRepository implements TenantConfigRepository {
  constructor(private readonly em: EntityManager) {}

  async getFiscalConfig(tenantId: string): Promise<TenantFiscalConfig> {
    const company = await this.em.findOne(Company, { id: tenantId });
    if (!company) {
       throw new NotFoundException(`Company/Tenant with ID ${tenantId} not found`);
    }

    const settings = company.settings || {};
    return {
      rfc: company.taxId,
      taxId: company.taxId,
      country: company.country,
      csdCertificate: settings['csdCertificate'],
      csdKey: settings['csdKey'],
      legalName: company.name,
      regime: company.regime || '601',
      postalCode: company.postalCode || '00000',
      resolutionNumber: settings['resolutionNumber']
    } as TenantFiscalConfig;
  }
}
