import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class PaymentMethod {
  @PrimaryKey()
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property()
  type!: string; // e.g., 'Visa', 'MasterCard'

  @Property()
  last4!: string;

  @Property()
  expiryDate!: string; // MM/YY

  @Property()
  isDefault = false;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(tenantId: string, type: string, last4: string, expiryDate: string) {
    this.tenantId = tenantId;
    this.type = type;
    this.last4 = last4;
    this.expiryDate = expiryDate;
  }
}
