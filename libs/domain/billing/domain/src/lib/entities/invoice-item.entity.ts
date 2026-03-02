import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { v4 } from 'uuid';

export class InvoiceItem {
  id: string = v4();
  @Property()
  description!: string;
  @Property()
  quantity!: number;
  @Property()
  unitPrice!: string;
  @Property()
  amount!: string;
  @Property()
  taxAmount!: string;
  @Property()
  productId?: string;

  constructor(description: string, quantity: number, unitPrice: string, amount: string, taxAmount: string) {
    this.description = description;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.amount = amount;
    this.taxAmount = taxAmount;
  }
}
