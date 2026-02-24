import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  WarehouseRepository,
  Warehouse,
  Location
} from '@virteex/domain-inventory-domain';

@Injectable()
export class MikroOrmWarehouseRepository implements WarehouseRepository {
  constructor(private readonly em: EntityManager) {}

  async save(warehouse: Warehouse): Promise<void> {
    await this.em.persistAndFlush(warehouse);
  }

  async findById(id: string): Promise<Warehouse | null> {
    return this.em.findOne(Warehouse, { id });
  }

  async findByCode(code: string, tenantId: string): Promise<Warehouse | null> {
    return this.em.findOne(Warehouse, { code, tenantId });
  }

  async saveLocation(location: Location): Promise<void> {
    await this.em.persistAndFlush(location);
  }

  async findLocationById(id: string): Promise<Location | null> {
    return this.em.findOne(Location, { id });
  }

  async findAll(tenantId: string): Promise<Warehouse[]> {
    return this.em.find(Warehouse, { tenantId });
  }

  async delete(id: string): Promise<void> {
    const warehouse = await this.em.findOne(Warehouse, { id });
    if (warehouse) {
      await this.em.removeAndFlush(warehouse);
    }
  }
}
