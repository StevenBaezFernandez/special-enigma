export class WarehouseNotFoundError extends Error {
  constructor(warehouseId: string) {
    super(`Warehouse with ID ${warehouseId} not found`);
    this.name = 'WarehouseNotFoundError';
  }
}
