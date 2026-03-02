import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { v4 } from 'uuid';

export enum SaleStatus {
  DRAFT = 'DRAFT',
  NEGOTIATION = 'NEGOTIATION',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export class Sale {
    id: string = v4();

  @Property()
    tenantId!: string;

  @Property()
    customerId!: string;

    customerName!: string;

    total!: string;

  @Property()
    status: SaleStatus = SaleStatus.DRAFT;

    items: any[] = [];

  @Property()
    createdAt: Date = new Date();

  constructor(tenantId: string, customerId: string, customerName: string, total: string) {
    this.tenantId = tenantId;
    this.customerId = customerId;
    this.customerName = customerName;
    this.total = total;
  }
}

export class SaleItem {
    id: string = v4();

  @Property()
    productId!: string;

    productName!: string;

    price!: string;

  @Property()
    quantity!: string;

    sale!: Sale;

  constructor(
  @Property()
    productId: string,
    productName: string,
    price: string,
  @Property()
    quantity: string,
  ) {
    this.productId = productId;
    this.productName = productName;
    this.price = price;
    this.quantity = quantity;
  }
}
