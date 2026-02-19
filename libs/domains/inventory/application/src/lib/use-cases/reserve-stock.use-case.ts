import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INVENTORY_REPOSITORY, InventoryRepository } from '@virteex/inventory-domain';

@Injectable()
export class ReserveStockUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY) private readonly repository: InventoryRepository
  ) {}

  async execute(tenantId: string, warehouseId: string, productSku: string, quantity: number): Promise<void> {
    const stock = await this.repository.findStock(warehouseId, productSku);

    if (!stock) {
      throw new NotFoundException(`Stock not found for product ${productSku} in warehouse ${warehouseId}`);
    }

    // Since quantity comes as number from API usually, but domain uses string/Decimal
    stock.removeQuantity(quantity.toString());

    await this.repository.saveStock(stock);
  }
}
