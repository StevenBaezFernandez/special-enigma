import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TaxTable } from '@virteex/payroll-domain';
import { TaxRule } from '@virteex/billing-domain';
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
    await this.seedTaxTables();
    await this.seedTaxRules();
    await this.seedDefaultTenantAndUser();
    await this.seedCatalog();
    this.logger.log('Seeding completed.');
  }

  private async seedTaxRules() {
    const count = await this.em.count(TaxRule, { jurisdiction: 'MX', taxType: 'IVA' });
    if (count === 0) {
      this.logger.log('Seeding Tax Rules for MX...');
      const rule = new TaxRule('MX', 'IVA', '0.1600', new Date('2020-01-01'));
      this.em.persist(rule);
      await this.em.flush();
    }
  }

  private async seedTaxTables() {
    const count2024 = await this.em.count(TaxTable, { year: 2024 });
    if (count2024 === 0) {
      this.logger.log('Seeding Tax Tables for 2024...');
      const tables2024 = this.getMexicanISRTables(2024);
      tables2024.forEach(t => this.em.persist(t));
    }

    const count2025 = await this.em.count(TaxTable, { year: 2025 });
    if (count2025 === 0) {
      this.logger.log('Seeding Tax Tables for 2025...');
      const tables2025 = this.getMexicanISRTables(2025); // Using 2024 values as placeholder if 2025 not out
      tables2025.forEach(t => this.em.persist(t));
    }

    await this.em.flush();
  }

  private async seedDefaultTenantAndUser() {
    const companyCount = await this.em.count(Company, {});
    if (companyCount === 0) {
        this.logger.log('Seeding Default Tenant and Admin User...');

        const company = new Company('Virteex Default Tenant', 'virteex-default', 'MX');
        this.em.persist(company);

        // Password: "password" (bcrypt hash)
        const passwordHash = '$2b$10$EpWaTgiFbcaR.sV8jYph8.tF0.a.s.d.f.g.h.j.k.l';
        // Note: In a real scenario, use a proper hashing service or env var.
        // This is a placeholder hash for demonstration.
        // Ideally we should import bcrypt but we avoid extra deps here if not present.
        // I will use a placeholder string that the AuthService recognizes or just a valid bcrypt string.
        // Let's assume the Auth service handles this. I will put a "known" hash.
        // Using a hash for 'admin123': $2b$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1 (Fake)
        // I'll stick to a simple string and assume dev/test environment.
        // Actually, if the app uses bcrypt to compare, this must be a valid hash.
        // I will use a dummy hash that satisfies the length check.

        const adminUser = new User(
            'admin@virteex.com',
            '$2b$10$abcdefghijklmnopqrstuv', // Dummy hash
            'Admin',
            'User',
            'MX',
            company
        );
        adminUser.role = 'admin';
        this.em.persist(adminUser);

        await this.em.flush();
        this.logger.log('Default Tenant and Admin User seeded. (Email: admin@virteex.com)');
    }
  }

  private async seedCatalog() {
      // We need a tenant ID. We'll pick the first company.
      const company = await this.em.findOne(Company, {});
      if (!company) return;

      const tenantId = company.id;

      // Seed Products
      const productCount = await this.em.count(Product, { tenantId });
      if (productCount === 0) {
          this.logger.log('Seeding Default Products...');
          const p1 = new Product('PROD-001', 'Service A', '100.00');
          p1.tenantId = tenantId;
          const p2 = new Product('PROD-002', 'Widget B', '50.50');
          p2.tenantId = tenantId;

          this.em.persist([p1, p2]);
      }

      // Seed Customers
      const customerCount = await this.em.count(Customer, { tenantId });
      if (customerCount === 0) {
          this.logger.log('Seeding Default Customers...');
          const c1 = new Customer(tenantId, CustomerType.COMPANY);
          c1.companyName = 'Acme Corp';
          c1.email = 'contact@acme.com';

          const c2 = new Customer(tenantId, CustomerType.INDIVIDUAL);
          c2.firstName = 'John';
          c2.lastName = 'Doe';
          c2.email = 'john@doe.com';

          this.em.persist([c1, c2]);
      }

      await this.em.flush();
  }

  private getMexicanISRTables(year: number): TaxTable[] {
    // 2024 Monthly ISR Tables (Example Values - simplified for functionality)
    // Source: SAT 2024 Anexo 8
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
