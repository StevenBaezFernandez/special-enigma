import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INVENTORY_REPOSITORY, InventoryRepository } from '@virteex/inventory-domain';

@Injectable()
export class ReserveStockUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY) private readonly repository: InventoryRepository
  ) {}

  async execute(tenantId: string, warehouseId: string, productSku: string, quantity: number): Promise<void> {
    // Find stock with batches populated!
    // Assuming repository.findStock handles population or we need to ensure it.
    // If findStock is generic, we might need to load batches specifically.
    // But since I cannot change repository interface easily without seeing implementation,
    // I will assume standard MikroORM behavior or add population hint if I could.
    // However, since `batches` is a collection, if it's not initialized, accessing it might throw or be empty.

    // In MikroORM, we need `populate: ['batches']`.
    // Since I can't change the repository call `findStock` arguments easily (it's an interface method),
    // I rely on the fact that `findStock` hopefully loads the entity.
    // If `findStock` returns a Stock entity, I can try `await stock.batches.init()` if it's lazy.

    const stock = await this.repository.findStock(warehouseId, productSku);

    if (!stock) {
      throw new NotFoundException(`Stock not found for product ${productSku} in warehouse ${warehouseId}`);
    }

    // Ensure batches are loaded for FIFO logic
    if (!stock.batches.isInitialized()) {
        await stock.batches.init();
    }

    // Deduct using FIFO logic
    stock.deductFromBatches(quantity.toString());

    await this.repository.saveStock(stock);
  }
}
