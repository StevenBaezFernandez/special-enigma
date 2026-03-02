import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { v4 } from 'uuid';
import Decimal from 'decimal.js';
import { InsufficientStockException } from '../exceptions/insufficient-stock.exception';
import { StockDataInconsistencyError } from '../errors/stock-data-inconsistency.error';

export class Stock {
  id: string;
  @Property()
  tenantId: string;
  @Property()
  productId: string;
  warehouseId: string;
  locationId?: string;
  @Property()
  quantity: string;
  batches: StockBatch[] = [];
  @Property()
  createdAt: Date;
  @Property()
  updatedAt: Date;

  constructor(
  @Property()
    tenantId: string,
  @Property()
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
      throw new InsufficientStockException(this.productId, this.warehouseId, totalStock.toString(), qty);
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
      throw new StockDataInconsistencyError(this.id);
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
        throw new InsufficientStockException(this.productId, this.warehouseId, current.toString(), qty);
      }
      this.quantity = result.toString();
    }
  }
}

export class StockBatch {
  id: string;
  stockId: string;
  @Property()
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
