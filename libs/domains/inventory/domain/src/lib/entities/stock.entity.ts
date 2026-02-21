import { Entity, PrimaryKey, Property, ManyToOne, Unique, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Warehouse } from './warehouse.entity';
import { Location } from './location.entity';
import { StockBatch } from './stock-batch.entity';
import Decimal from 'decimal.js';

@Entity()
@Unique({ properties: ['warehouse', 'location', 'productId'] })
export class Stock {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property()
  productId!: string;

  @ManyToOne(() => Warehouse)
  warehouse!: Warehouse;

  @ManyToOne(() => Location, { nullable: true })
  location?: Location;

  @Property({ type: 'decimal', precision: 14, scale: 4 })
  quantity = '0';

  @OneToMany(() => StockBatch, b => b.stock, { cascade: [Cascade.PERSIST, Cascade.REMOVE] })
  batches = new Collection<StockBatch>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(
    tenantId: string,
    productId: string,
    warehouse: Warehouse,
    quantity = '0',
    location?: Location
  ) {
    this.tenantId = tenantId;
    this.productId = productId;
    this.warehouse = warehouse;
    this.quantity = quantity;
    if (location) {
      this.location = location;
    }
  }

  addQuantity(qty: string, entryDate: Date = new Date(), cost?: string): void {
    const current = new Decimal(this.quantity);
    const addition = new Decimal(qty);
    this.quantity = current.plus(addition).toString();

    // Create a new batch for the added quantity
    const batch = new StockBatch(this, qty, entryDate);
    if (cost) batch.cost = cost;
    this.batches.add(batch);
  }

  /**
   * Deducts quantity using FIFO strategy (First-In, First-Out).
   * Consumes oldest batches first.
   */
  deductFromBatches(qty: string): void {
    let remainingToDeduct = new Decimal(qty);
    const totalStock = new Decimal(this.quantity);

    if (totalStock.lessThan(remainingToDeduct)) {
      throw new Error(`Insufficient stock. Available: ${totalStock}, Requested: ${qty}`);
    }

    // Sort batches by entry date (FIFO)
    // Note: If batches are not initialized, this will throw.
    // Ensure batches are loaded before calling this.
    const sortedBatches = this.batches.getItems().sort((a, b) =>
      a.entryDate.getTime() - b.entryDate.getTime()
    );

    for (const batch of sortedBatches) {
      if (remainingToDeduct.isZero()) break;

      const batchQty = new Decimal(batch.quantity);

      if (batchQty.greaterThanOrEqualTo(remainingToDeduct)) {
        // This batch can satisfy the remaining request
        const newBatchQty = batchQty.minus(remainingToDeduct);
        batch.quantity = newBatchQty.toString();
        remainingToDeduct = new Decimal(0);

        // If batch is empty, we could remove it, but maybe keep for history?
        // Let's remove empty batches to keep table clean for now
        if (newBatchQty.isZero()) {
            this.batches.remove(batch);
        }
      } else {
        // This batch is fully consumed
        remainingToDeduct = remainingToDeduct.minus(batchQty);
        batch.quantity = '0'; // Or remove
        this.batches.remove(batch);
      }
    }

    if (!remainingToDeduct.isZero()) {
       // Should not happen if totalStock check passed, unless data inconsistency
       // In case batches don't sum up to quantity (data inconsistency), fallback to simple deduction?
       // But user wants robust. Let's throw.
       throw new Error('Data Inconsistency: Stock quantity exists but batches are missing or insufficient.');
    }

    // Update total quantity
    this.quantity = totalStock.minus(new Decimal(qty)).toString();
  }

  // Deprecated or fallback method
  removeQuantity(qty: string): void {
      // If batches exist, use them?
      if (this.batches.length > 0) {
          this.deductFromBatches(qty);
      } else {
          // Fallback for legacy data without batches
        const current = new Decimal(this.quantity);
        const subtraction = new Decimal(qty);
        const result = current.minus(subtraction);

        if (result.isNegative()) {
            throw new Error('Insufficient stock');
        }
        this.quantity = result.toString();
      }
  }
}
