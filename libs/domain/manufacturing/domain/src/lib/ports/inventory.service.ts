export const INVENTORY_SERVICE = 'INVENTORY_SERVICE';

export interface InventoryService {
  checkAndReserveStock(tenantId: string, warehouseId: string, productSku: string, quantity: number): Promise<void>;
}
