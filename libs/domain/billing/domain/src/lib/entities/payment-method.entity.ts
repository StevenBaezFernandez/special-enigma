import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { v4 } from 'uuid';

export class PaymentMethod {
    id: string = v4();

  @Property()
    tenantId!: string;

    type!: string; // e.g., 'Visa', 'MasterCard'

    last4!: string;

    expiryDate!: string; // MM/YY

    isDefault = false;

  @Property()
    createdAt: Date = new Date();

  @Property()
    updatedAt: Date = new Date();

  constructor(tenantId: string, type: string, last4: string, expiryDate: string) {
    this.tenantId = tenantId;
    this.type = type;
    this.last4 = last4;
    this.expiryDate = expiryDate;
  }
}
