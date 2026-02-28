import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Company, CompanyRepository } from '@virteex/domain-identity-domain';

@Injectable()
export class MikroOrmCompanyRepository implements CompanyRepository {
  constructor(private readonly em: EntityManager) {}

  async save(company: Company): Promise<void> {
    await this.em.persistAndFlush(company);
  }

  async findById(id: string): Promise<Company | null> {
    return this.em.findOne(Company, { id });
  }

  async findByTaxId(taxId: string): Promise<Company | null> {
    return this.em.findOne(Company, { taxId });
  }

  async existsByTaxId(taxId: string): Promise<boolean> {
    const count = await this.em.count(Company, { taxId });
    return count > 0;
  }

  async findAll(options: any = {}): Promise<Company[]> {
    return this.em.find(Company, options);
  }
}
