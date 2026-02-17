import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TaxTable } from '@virteex/payroll-domain';
import { User, Company } from '@virteex/identity-domain';
import { Product } from '@virteex/catalog-domain';
import { Customer } from '@virteex/crm-domain';
import { CustomerType } from '@virteex/contracts';
import { v4 } from 'uuid';

@Injectable()
export class InitialSeederService {
  private readonly logger = new Logger(InitialSeederService.name);

  constructor(private readonly em: EntityManager) {}

  async seed() {
    this.logger.log('Checking for initial data seeds...');
    const em = this.em.fork();

    await this.seedTaxTables(em);
    await this.seedDefaultTenantAndUser(em);
    await this.seedCatalog(em);
    this.logger.log('Seeding completed.');
  }

  private async seedTaxTables(em: EntityManager) {
    const count2024 = await em.count(TaxTable, { year: 2024 });
    if (count2024 === 0) {
      this.logger.log('Seeding Tax Tables for 2024...');
      const tables2024 = this.getMexicanISRTables(2024);
      tables2024.forEach(t => em.persist(t));
    }

    const count2025 = await em.count(TaxTable, { year: 2025 });
    if (count2025 === 0) {
      this.logger.log('Seeding Tax Tables for 2025...');
      const tables2025 = this.getMexicanISRTables(2025);
      tables2025.forEach(t => em.persist(t));
    }

    await em.flush();
  }

  private async seedDefaultTenantAndUser(em: EntityManager) {
    const companyCount = await em.count(Company, {});
    if (companyCount === 0) {
        this.logger.log('Seeding Default Tenant and Admin User...');

        const company = new Company('Virteex Default Tenant', 'virteex-default', 'MX');
        em.persist(company);

        const adminUser = new User(
            'admin@virteex.com',
            '$2b$10$abcdefghijklmnopqrstuv', // Dummy hash
            'Admin',
            'User',
            'MX',
            company
        );
        adminUser.role = 'admin';
        em.persist(adminUser);

        await em.flush();
        this.logger.log('Default Tenant and Admin User seeded. (Email: admin@virteex.com)');
    }
  }

  private async seedCatalog(em: EntityManager) {
      const companies = await em.find(Company, {}, { limit: 1 });
      const company = companies.length > 0 ? companies[0] : null;

      if (!company) return;

      const tenantId = company.id;

      const productCount = await em.count(Product, { tenantId });
      if (productCount === 0) {
          this.logger.log('Seeding Default Products...');
          const p1 = new Product('PROD-001', 'Service A', '100.00');
          p1.tenantId = tenantId;
          const p2 = new Product('PROD-002', 'Widget B', '50.50');
          p2.tenantId = tenantId;

          em.persist([p1, p2]);
      }

      const customerCount = await em.count(Customer, { tenantId });
      if (customerCount === 0) {
          this.logger.log('Seeding Default Customers...');
          const c1 = new Customer(tenantId, CustomerType.COMPANY);
          c1.companyName = 'Acme Corp';
          c1.email = 'contact@acme.com';

          const c2 = new Customer(tenantId, CustomerType.INDIVIDUAL);
          c2.firstName = 'John';
          c2.lastName = 'Doe';
          c2.email = 'john@doe.com';

          em.persist([c1, c2]);
      }

      await em.flush();
  }

  private getMexicanISRTables(year: number): TaxTable[] {
    const data = [
      { limit: 0.01, fixed: 0.00, percent: 1.92 },
      { limit: 746.05, fixed: 14.32, percent: 6.40 },
      { limit: 6332.06, fixed: 371.83, percent: 10.88 },
      { limit: 11128.02, fixed: 893.63, percent: 16.00 },
      { limit: 12935.83, fixed: 1182.88, percent: 17.92 },
      { limit: 15487.72, fixed: 1640.18, percent: 21.36 },
      { limit: 31236.50, fixed: 5004.12, percent: 23.52 },
      { limit: 49233.01, fixed: 9236.89, percent: 30.00 },
      { limit: 93993.91, fixed: 22665.17, percent: 32.00 },
      { limit: 125325.21, fixed: 32691.18, percent: 34.00 },
      { limit: 375975.62, fixed: 117912.32, percent: 35.00 },
    ];

    return data.map(d => new TaxTable(d.limit, d.fixed, d.percent, year, 'MONTHLY'));
  }
}
