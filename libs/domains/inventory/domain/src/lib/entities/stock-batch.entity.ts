import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Stock } from './stock.entity';
import Decimal from 'decimal.js';

@Entity()
export class StockBatch {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => Stock)
  stock!: Stock;

  @Property({ type: 'decimal', precision: 14, scale: 4 })
  quantity = '0';

  @Property()
  entryDate: Date = new Date();

  @Property({ nullable: true })
  expirationDate?: Date;

  @Property({ type: 'decimal', precision: 14, scale: 4, nullable: true })
  cost?: string;

  constructor(stock: Stock, quantity: string, entryDate: Date = new Date()) {
    this.stock = stock;
    this.quantity = quantity;
    this.entryDate = entryDate;
  }

  get quantityDecimal(): Decimal {
    return new Decimal(this.quantity);
  }

  setQuantity(qty: Decimal) {
    this.quantity = qty.toString();
  }
}
