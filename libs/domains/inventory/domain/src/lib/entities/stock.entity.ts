import { v4 } from 'uuid';
import Decimal from 'decimal.js';

export class Stock {
  id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  locationId?: string;
  quantity: string;
  batches: StockBatch[] = [];
  createdAt: Date;
  updatedAt: Date;

  constructor(
    tenantId: string,
    productId: string,
    warehouseId: string,
    quantity = '0',
    locationId?: string,
    id?: string
  ) {
    this.id = id || v4();
    this.tenantId = tenantId;
    this.productId = productId;
    this.warehouseId = warehouseId;
    this.quantity = quantity;
    this.locationId = locationId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  addQuantity(qty: string, entryDate: Date = new Date(), cost?: string): void {
    const current = new Decimal(this.quantity);
    const addition = new Decimal(qty);
    this.quantity = current.plus(addition).toString();

    const batch = new StockBatch(this.id, qty, entryDate);
    if (cost) batch.cost = cost;
    this.batches.push(batch);
  }

  deductFromBatches(qty: string): void {
    let remainingToDeduct = new Decimal(qty);
    const totalStock = new Decimal(this.quantity);

    if (totalStock.lessThan(remainingToDeduct)) {
      throw new Error(`Insufficient stock. Available: ${totalStock}, Requested: ${qty}`);
    }

    const sortedBatches = [...this.batches].sort((a, b) =>
      a.entryDate.getTime() - b.entryDate.getTime()
    );

    for (const batch of sortedBatches) {
      if (remainingToDeduct.isZero()) break;

      const batchQty = new Decimal(batch.quantity);

      if (batchQty.greaterThanOrEqualTo(remainingToDeduct)) {
        batch.quantity = batchQty.minus(remainingToDeduct).toString();
        remainingToDeduct = new Decimal(0);
      } else {
        remainingToDeduct = remainingToDeduct.minus(batchQty);
        batch.quantity = '0';
      }
    }

    this.batches = this.batches.filter(b => new Decimal(b.quantity).greaterThan(0));

    if (!remainingToDeduct.isZero()) {
       throw new Error('Data Inconsistency: Stock quantity exists but batches are missing or insufficient.');
    }

    this.quantity = totalStock.minus(new Decimal(qty)).toString();
  }

  removeQuantity(qty: string): void {
      if (this.batches.length > 0) {
          this.deductFromBatches(qty);
      } else {
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

export class StockBatch {
  id: string;
  stockId: string;
  quantity: string;
  entryDate: Date;
  expirationDate?: Date;
  cost?: string;

  constructor(stockId: string, quantity: string, entryDate: Date = new Date(), id?: string) {
    this.id = id || v4();
    this.stockId = stockId;
    this.quantity = quantity;
    this.entryDate = entryDate;
  }
}
