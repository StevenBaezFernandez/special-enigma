export class InsufficientStockException extends Error {
  constructor(productId: string, warehouseId: string, available?: string, requested?: string) {
    super(
      available && requested
        ? `Insufficient stock for product ${productId} in warehouse ${warehouseId}. Available: ${available}, Requested: ${requested}`
        : `Insufficient stock for product ${productId} in warehouse ${warehouseId}`
    );
    this.name = 'InsufficientStockException';
  }
}
