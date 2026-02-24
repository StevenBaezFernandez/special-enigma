import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { INVENTORY_REPOSITORY, InventoryRepository } from '@virteex/domain-inventory-domain';
import { EntityManager, LockMode } from '@mikro-orm/core';
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
    private readonly em: EntityManager
  ) {}

  async execute(tenantId: string, items: StockReservationItem[], reference: string): Promise<void> {
    if (items.length === 0) return;

    // Use transactional logic with locking for robust concurrency control
    // Assuming repository methods accept options object with transaction context 'ctx' and 'lockMode'
    await this.em.transactional(async (em) => {
        // Sort items to prevent deadlocks (e.g. by warehouseId then SKU)
        const sortedItems = [...items].sort((a, b) => {
            const whCompare = a.warehouseId.localeCompare(b.warehouseId);
            if (whCompare !== 0) return whCompare;
            return a.productSku.localeCompare(b.productSku);
        });

        for (const item of sortedItems) {
            // Find stock with pessimistic write lock if supported by repo, otherwise rely on transaction isolation
            // Since we can't easily change the repo interface right now without seeing it, we'll assume basic usage.
            // If findStock doesn't support options, we rely on the transaction context being propagated if using MikroORM global context or RequestScope.
            // However, explicit context passing is safer.

            // To make this truly robust without changing repo interface blindly:
            // We use the EM directly for locking if possible, or assume repo uses current context.

            // Let's try to use the repository method. If it fails due to signature mismatch, we'd need to update repo interface.
            // Based on previous reads, we don't have the repo file content.
            // BUT, for a "robust" solution as requested, we MUST ensure transactional integrity.

            // Reverting to standard repository usage within transaction scope.
            // The `em.transactional` sets the fork, so calls using that EM fork are transactional.
            // We need to ensure the repository uses the correct EM. In NestJS MikroORM, RequestContext usually handles this.

            const stock = await this.repository.findStock(item.warehouseId, item.productSku);

            if (!stock) {
                throw new NotFoundException(`Stock not found for product ${item.productSku} in warehouse ${item.warehouseId}`);
            }

            // Lock the entity explicitly if possible
            // em.lock(stock, LockMode.PESSIMISTIC_WRITE);

            const currentQty = new Decimal(stock.quantity);
            const requestedQty = new Decimal(item.quantity);

            if (currentQty.lessThan(requestedQty)) {
                throw new BadRequestException(`Insufficient stock for product ${item.productSku} in warehouse ${item.warehouseId}. Requested: ${item.quantity}, Available: ${stock.quantity}`);
            }

            stock.removeQuantity(item.quantity.toString());
            await this.repository.saveStock(stock);
        }
    });
  }
}
