import { Entity, PrimaryKey, Property, Collection } from '@mikro-orm/core';

@Entity()
export class PurchaseOrderItem {
  @PrimaryKey()
  id!: string;

  @Property()
  sku!: string;
}

@Entity()
export class PurchaseOrder {
  @PrimaryKey()
  id!: string;

  @Property({ type: 'Collection' })
  items = new Collection<PurchaseOrderItem>(this);
}
