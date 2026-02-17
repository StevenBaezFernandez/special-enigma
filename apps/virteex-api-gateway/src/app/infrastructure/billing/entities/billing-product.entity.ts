import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'billing_products' })
export class BillingProductEntity {
  @PrimaryKey({ type: 'string' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  name!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Property({ nullable: true })
  taxGroup?: string;

  @Property({ nullable: true })
  fiscalCode?: string;

  @Property()
  isActive: boolean = true;
}
