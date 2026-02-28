export class StockNotFoundError extends Error {
  constructor(productId: string, warehouseId: string) {
    super(`Stock not found for product ${productId} in warehouse ${warehouseId}`);
    this.name = 'StockNotFoundError';
  }
}
