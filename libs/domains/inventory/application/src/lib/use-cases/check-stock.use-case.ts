import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INVENTORY_REPOSITORY, InventoryRepository } from '@virteex/domain-inventory-domain';
import Decimal from 'decimal.js';

@Injectable()
export class CheckStockUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY) private readonly repository: InventoryRepository
  ) {}

  async execute(warehouseId: string, productSku: string, quantity: number): Promise<boolean> {
    const stock = await this.repository.findStock(warehouseId, productSku);

    if (!stock) {
      return false;
    }

    const currentStock = new Decimal(stock.quantity);
    const required = new Decimal(quantity);

    return currentStock.greaterThanOrEqualTo(required);
  }
}
