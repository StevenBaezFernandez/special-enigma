import { InventoryMovement } from '../entities/inventory-movement.entity';
import { Stock } from '../entities/stock.entity';

export interface InventoryRepository {
  saveMovement(movement: InventoryMovement): Promise<void>;
  findStock(warehouseId: string, productId: string, locationId?: string): Promise<Stock | null>;
  saveStock(stock: Stock): Promise<void>;
  saveBatch(stocks: Stock[], movements: InventoryMovement[]): Promise<void>;
}

export const INVENTORY_REPOSITORY = 'INVENTORY_REPOSITORY';
