import { Warehouse } from '../entities/warehouse.entity';
import { Location } from '../entities/location.entity';

export interface WarehouseRepository {
  save(warehouse: Warehouse): Promise<void>;
  findById(id: string): Promise<Warehouse | null>;
  findByCode(code: string, tenantId: string): Promise<Warehouse | null>;
  saveLocation(location: Location): Promise<void>;
  findLocationById(id: string): Promise<Location | null>;
  findAll(tenantId: string): Promise<Warehouse[]>;
  delete(id: string): Promise<void>;
}

export const WAREHOUSE_REPOSITORY = 'WAREHOUSE_REPOSITORY';
