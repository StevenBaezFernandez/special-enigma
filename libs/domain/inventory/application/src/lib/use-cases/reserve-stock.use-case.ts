import { Injectable, Inject } from '@nestjs/common';
import { INVENTORY_REPOSITORY, type InventoryRepository, StockNotFoundError } from '@virteex/domain-inventory-domain';

@Injectable()
export class ReserveStockUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY) private readonly repository: InventoryRepository
  ) {}

  async execute(tenantId: string, warehouseId: string, productSku: string, quantity: number): Promise<void> {
    const stock = await this.repository.findStockWithBatches(warehouseId, productSku);

    if (!stock) {
      throw new StockNotFoundError(productSku, warehouseId);
    }

    stock.deductFromBatches(quantity.toString());

    await this.repository.saveStock(stock);
  }
}
