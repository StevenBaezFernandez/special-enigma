import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TaxTable } from '@virteex/payroll-domain';

@Injectable()
export class InitialSeederService {
  private readonly logger = new Logger(InitialSeederService.name);

  constructor(private readonly em: EntityManager) {}

  async seed() {
    this.logger.log('Checking for initial data seeds...');
    const em = this.em.fork();

    await this.seedTaxTables(em);
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
