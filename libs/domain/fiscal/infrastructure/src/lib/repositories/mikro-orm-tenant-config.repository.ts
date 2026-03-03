import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Company } from '@virteex/domain-identity-domain';
import { TenantConfigRepository, TenantFiscalConfig } from '@virteex/domain-fiscal-domain';

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
      legalName: (company as any).legalName || company.name,
      regime: settings['fiscalRegime'] || '601',
      postalCode: company.postalCode || '00000'
    };
  }
}
