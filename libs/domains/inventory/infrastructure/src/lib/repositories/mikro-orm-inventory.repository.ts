import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  InventoryRepository,
  InventoryMovement,
  Stock
} from '@virteex/domain-inventory-domain';

@Injectable()
export class MikroOrmInventoryRepository implements InventoryRepository {
  constructor(private readonly em: EntityManager) {}

  async saveMovement(movement: InventoryMovement): Promise<void> {
    await this.em.persist(movement);
    await this.em.flush();
  }

  async findStock(warehouseId: string, productId: string, locationId?: string): Promise<Stock | null> {
    const where: any = { warehouse: warehouseId, productId };
    if (locationId) {
      where.location = locationId;
    } else {
      where.location = null;
    }
    return this.em.findOne(Stock, where);
  }

  async findStockWithBatches(warehouseId: string, productId: string, locationId?: string): Promise<Stock | null> {
    const where: any = { warehouse: warehouseId, productId };
    if (locationId) {
      where.location = locationId;
    } else {
      where.location = null;
    }
    return this.em.findOne(Stock, where, { populate: ['batches'] });
  }

  async saveStock(stock: Stock): Promise<void> {
    await this.em.persist(stock);
    await this.em.flush();
  }

  async saveBatch(stocks: Stock[], movements: InventoryMovement[]): Promise<void> {
    // If stocks are already persisted (managed), just movements need persist.
    // But persisting managed entities is fine.
    // We flush once at the end.

    // MikroORM persist handles arrays.
    if (stocks.length > 0) await this.em.persist(stocks);
    if (movements.length > 0) await this.em.persist(movements);

    await this.em.flush();
  }
}
