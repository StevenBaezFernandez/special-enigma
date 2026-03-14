import { Injectable, Inject, Logger } from '@nestjs/common';
import { INVENTORY_REPOSITORY, type InventoryRepository, InsufficientStockException, StockNotFoundError, InventoryMovement, InventoryMovementType } from '@virteex/domain-inventory-domain';
import Decimal from 'decimal.js';

export interface StockReservationItem {
  warehouseId: string;
  productSku: string;
  quantity: number;
}

@Injectable()
export class ReserveBatchStockUseCase {
  private readonly logger = new Logger(ReserveBatchStockUseCase.name);

  constructor(
    @Inject(INVENTORY_REPOSITORY) private readonly repository: InventoryRepository,
  ) {}

  async execute(tenantId: string, items: StockReservationItem[], reference: string): Promise<void> {
    if (items.length === 0) return;

    const sortedItems = [...items].sort((a, b) => {
      const whCompare = a.warehouseId.localeCompare(b.warehouseId);
      if (whCompare !== 0) return whCompare;
      return a.productSku.localeCompare(b.productSku);
    });

    for (const item of sortedItems) {
      const stock = await this.repository.findStock(item.warehouseId, item.productSku);
      if (!stock) {
        throw new StockNotFoundError(item.productSku, item.warehouseId);
      }

      const currentQty = new Decimal(stock.quantity);
      const requestedQty = new Decimal(item.quantity);
      if (currentQty.lessThan(requestedQty)) {
        throw new InsufficientStockException(item.productSku, item.warehouseId, stock.quantity, item.quantity.toString());
      }

      stock.removeQuantity(item.quantity.toString());

      const movement = new InventoryMovement(
        tenantId,
        item.productSku,
        item.warehouseId,
        InventoryMovementType.OUT,
        item.quantity.toString(),
        reference,
        stock.locationId
      );

      await this.repository.saveStock(stock);
      await this.repository.saveMovement(movement);
    }

    this.logger.log(`Batch stock reservation applied. tenantId=${tenantId} reference=${reference} items=${items.length}`);
  }
}
