import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INVENTORY_REPOSITORY, InventoryRepository } from '@virteex/domain-inventory-domain';

@Injectable()
export class ReserveStockUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY) private readonly repository: InventoryRepository
  ) {}

  async execute(tenantId: string, warehouseId: string, productSku: string, quantity: number): Promise<void> {
    const stock = await this.repository.findStockWithBatches(warehouseId, productSku);

    if (!stock) {
      throw new NotFoundException(`Stock not found for product ${productSku} in warehouse ${warehouseId}`);
    }

    // Deduct using FIFO logic
    stock.deductFromBatches(quantity.toString());

    await this.repository.saveStock(stock);
  }
}
