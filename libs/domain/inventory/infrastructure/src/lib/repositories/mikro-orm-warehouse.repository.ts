import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  WarehouseRepository,
  Warehouse,
  Location
} from '@virteex/domain-inventory-domain';
import { WarehouseOrmEntity } from '../persistence/entities/warehouse.orm-entity';
import { InventoryMapper } from '../persistence/mappers/inventory.mapper';
import { LocationOrmEntity } from '../persistence/entities/location.orm-entity';

@Injectable()
export class MikroOrmWarehouseRepository implements WarehouseRepository {
  constructor(private readonly em: EntityManager) {}

  async save(warehouse: Warehouse): Promise<void> {
    const orm = InventoryMapper.toWarehouseOrm(warehouse);
    await this.em.persistAndFlush(orm);
  }

  async findById(id: string): Promise<Warehouse | null> {
    const orm = await this.em.findOne(WarehouseOrmEntity, { id });
    return orm ? InventoryMapper.toWarehouseDomain(orm) : null;
  }

  async findByIds(ids: string[]): Promise<Warehouse[]> {
    const orms = await this.em.find(WarehouseOrmEntity, { id: { $in: ids } });
    return orms.map(orm => InventoryMapper.toWarehouseDomain(orm));
  }

  async findByCode(code: string, tenantId: string): Promise<Warehouse | null> {
    const orm = await this.em.findOne(WarehouseOrmEntity, { code, tenantId });
    return orm ? InventoryMapper.toWarehouseDomain(orm) : null;
  }

  async saveLocation(location: Location): Promise<void> {
    const orm = InventoryMapper.toLocationOrm(location);
    await this.em.persistAndFlush(orm);
  }

  async findLocationById(id: string): Promise<Location | null> {
    const orm = await this.em.findOne(LocationOrmEntity, { id });
    return orm ? InventoryMapper.toLocationDomain(orm) : null;
  }

  async findAll(tenantId: string): Promise<Warehouse[]> {
    const orms = await this.em.find(WarehouseOrmEntity, { tenantId });
    return orms.map(orm => InventoryMapper.toWarehouseDomain(orm));
  }

  async delete(id: string): Promise<void> {
    const warehouse = await this.em.findOne(WarehouseOrmEntity, { id });
    if (warehouse) {
      await this.em.removeAndFlush(warehouse);
    }
  }
}
