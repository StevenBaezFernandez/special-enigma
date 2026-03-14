import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { type InventoryRepository, InventoryMovement, Stock } from '@virteex/domain-inventory-domain';
import { StockOrmEntity } from '../persistence/entities/stock.orm-entity';
import { InventoryMapper } from '../persistence/mappers/inventory.mapper';
import { InventoryMovementOrmEntity } from '../persistence/entities/inventory-movement.orm-entity';

@Injectable()
export class MikroOrmInventoryRepository implements InventoryRepository {
  constructor(private readonly em: EntityManager) {}

  async saveMovement(movement: InventoryMovement): Promise<void> {
    const orm = InventoryMapper.toMovementOrm(movement);
    await this.em.persist(orm);
    await this.em.flush();
  }

  async findStock(warehouseId: string, productId: string, locationId?: string): Promise<Stock | null> {
    const where: any = { warehouse: warehouseId, productId };
    if (locationId) {
      where.location = locationId;
    } else {
      where.location = null;
    }
    const orm = await this.em.findOne(StockOrmEntity, where);
    return orm ? InventoryMapper.toStockDomain(orm) : null;
  }

  async findStockWithBatches(warehouseId: string, productId: string, locationId?: string): Promise<Stock | null> {
    const where: any = { warehouse: warehouseId, productId };
    if (locationId) {
      where.location = locationId;
    } else {
      where.location = null;
    }
    const orm = await this.em.findOne(StockOrmEntity, where, { populate: ['batches'] });
    return orm ? InventoryMapper.toStockDomain(orm) : null;
  }

  async saveStock(stock: Stock): Promise<void> {
    const orm = InventoryMapper.toStockOrm(stock);
    // Use assign or wrap to merge if it already exists in identity map or database
    // For simplicity in this refactor, let's use upsert or similar if needed.
    // MikroORM persist on an entity with an ID will try to find it.
    await this.em.persist(orm);
    await this.em.flush();
  }

  async saveBatch(stocks: Stock[], movements: InventoryMovement[]): Promise<void> {
    const stockOrms = stocks.map(s => InventoryMapper.toStockOrm(s));
    const movementOrms = movements.map(m => InventoryMapper.toMovementOrm(m));

    if (stockOrms.length > 0) await this.em.persist(stockOrms);
    if (movementOrms.length > 0) await this.em.persist(movementOrms);

    await this.em.flush();
  }
}
