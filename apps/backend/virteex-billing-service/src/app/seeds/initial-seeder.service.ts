import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { TaxRule } from '@virteex/billing-domain';

@Injectable()
export class InitialSeederService {
  private readonly logger = new Logger(InitialSeederService.name);

  constructor(private readonly em: EntityManager) {}

  async seed() {
    this.logger.log('Checking for initial data seeds...');
    const em = this.em.fork();

    await this.seedTaxRules(em);

    this.logger.log('Seeding completed.');
  }

  private async seedTaxRules(em: EntityManager) {
    try {
        const count = await em.count(TaxRule, { jurisdiction: 'MX', taxType: 'IVA' });
        if (count === 0) {
          this.logger.log('Seeding Tax Rules for MX...');
          const rule = new TaxRule('MX', 'IVA', '0.1600', new Date('2020-01-01'));
          em.persist(rule);
          await em.flush();
        }
    } catch (e) {
        this.logger.warn('Skipping TaxRule seeding due to potential entity conflict or schema mismatch: ' + e);
    }
  }
}
