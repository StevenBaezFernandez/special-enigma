import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { type SatCatalogRepository, SatCatalogItem, SatPaymentForm, SatPaymentMethod, SatCfdiUsage } from '@virteex/domain-catalog-domain';

@Injectable()
export class MikroOrmSatCatalogRepository implements SatCatalogRepository {
  constructor(private readonly em: EntityManager) {}

  async getPaymentForms(): Promise<SatCatalogItem[]> {
    const items = await this.em.find(SatPaymentForm, {});
    return items.map(i => ({ code: i.code, name: i.name }));
  }

  async getPaymentMethods(): Promise<SatCatalogItem[]> {
    const items = await this.em.find(SatPaymentMethod, {});
    return items.map(i => ({ code: i.code, name: i.name }));
  }

  async getCfdiUsages(): Promise<SatCatalogItem[]> {
    const items = await this.em.find(SatCfdiUsage, {});
    return items.map(i => ({ code: i.code, name: i.name }));
  }
}
