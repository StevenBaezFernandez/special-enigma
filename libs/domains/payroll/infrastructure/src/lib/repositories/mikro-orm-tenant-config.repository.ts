import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Company } from '@virteex/identity-domain';
import { TenantConfigRepository, TenantFiscalConfig } from '@virteex/payroll-domain';

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
      country: company.country,
      csdCertificate: settings['csdCertificate'],
      csdKey: settings['csdKey']
    };
  }
}
