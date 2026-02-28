import { Warehouse, Location, Stock, StockBatch, InventoryMovement } from '@virteex/domain-inventory-domain';
import { WarehouseOrmEntity } from '../entities/warehouse.orm-entity';
import { LocationOrmEntity } from '../entities/location.orm-entity';
import { StockOrmEntity, StockBatchOrmEntity } from '../entities/stock.orm-entity';
import { InventoryMovementOrmEntity } from '../entities/inventory-movement.orm-entity';

export class InventoryMapper {
  static toWarehouseDomain(orm: WarehouseOrmEntity): Warehouse {
    const domain = new Warehouse(orm.tenantId, orm.code, orm.name, orm.id);
    domain.changeAddress(orm.address);
    domain.changeDescription(orm.description);
    if (orm.isActive) {
      domain.activate();
    } else {
      domain.deactivate();
    }
    domain.hydrateTimestamps(orm.createdAt, orm.updatedAt);
    return domain;
  }

  static toWarehouseOrm(domain: Warehouse): WarehouseOrmEntity {
    const orm = new WarehouseOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.code = domain.code;
    orm.name = domain.name;
    orm.address = domain.address;
    orm.description = domain.description;
    orm.isActive = domain.isActive;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  static toLocationDomain(orm: LocationOrmEntity): Location {
    const domain = new Location(orm.tenantId, orm.warehouse.id, orm.code, orm.type, orm.id);
    domain.createdAt = orm.createdAt;
    domain.updatedAt = orm.updatedAt;
    return domain;
  }

  static toLocationOrm(domain: Location): LocationOrmEntity {
    const orm = new LocationOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.warehouse = { id: domain.warehouseId } as any;
    orm.code = domain.code;
    orm.type = domain.type;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  static toStockDomain(orm: StockOrmEntity): Stock {
    const domain = new Stock(
      orm.tenantId,
      orm.productId,
      orm.warehouse.id,
      orm.quantity,
      orm.location?.id,
      orm.id
    );
    domain.createdAt = orm.createdAt;
    domain.updatedAt = orm.updatedAt;
    if (orm.batches && orm.batches.isInitialized()) {
      domain.batches = orm.batches.getItems().map(b => this.toStockBatchDomain(b));
    }
    return domain;
  }

  static toStockBatchDomain(orm: StockBatchOrmEntity): StockBatch {
    const domain = new StockBatch(orm.stock.id, orm.quantity, orm.entryDate, orm.id);
    domain.expirationDate = orm.expirationDate;
    domain.cost = orm.cost;
    return domain;
  }

  static toStockOrm(domain: Stock): StockOrmEntity {
    const orm = new StockOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.productId = domain.productId;
    orm.warehouse = { id: domain.warehouseId } as any;
    if (domain.locationId) {
      orm.location = { id: domain.locationId } as any;
    }
    orm.quantity = domain.quantity;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;

    // Batches mapping would need more care if we want to sync them back.
    // For now, let's assume saveStock might not be the primary way to save batches if they are complex.
    // But let's try to map them.
    if (domain.batches) {
      domain.batches.forEach(b => {
        const batchOrm = this.toStockBatchOrm(b);
        batchOrm.stock = orm;
        orm.batches.add(batchOrm);
      });
    }

    return orm;
  }

  static toStockBatchOrm(domain: StockBatch): StockBatchOrmEntity {
    const orm = new StockBatchOrmEntity();
    orm.id = domain.id;
    orm.quantity = domain.quantity;
    orm.entryDate = domain.entryDate;
    orm.expirationDate = domain.expirationDate;
    orm.cost = domain.cost;
    return orm;
  }

  static toMovementOrm(domain: InventoryMovement): InventoryMovementOrmEntity {
    const orm = new InventoryMovementOrmEntity();
    orm.id = domain.id;
    orm.tenantId = domain.tenantId;
    orm.productId = domain.productId;
    orm.warehouse = { id: domain.warehouseId } as any;
    if (domain.locationId) {
      orm.location = { id: domain.locationId } as any;
    }
    orm.type = domain.type;
    orm.quantity = domain.quantity;
    orm.reference = domain.reference;
    orm.date = domain.date;
    orm.createdAt = domain.createdAt;
    orm.lotId = domain.lotId;
    orm.serialNumber = domain.serialNumber;
    return orm;
  }
}
