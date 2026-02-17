import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ schema: 'catalog' })
export class Product {
  @PrimaryKey()
  id!: number;

  @Property()
  tenantId!: string; // Managed by TenantSubscriber, not by user

  @Property()
  sku!: string;

  @Property()
  name!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Property({ nullable: true })
  fiscalCode?: string; // NCM/HS Code

  @Property({ nullable: true })
  taxGroup?: string;

  @Property()
  isActive = true;

  constructor(sku: string, name: string, price: string) {
    this.sku = sku;
    this.name = name;
    this.changePrice(price);
  }

  // Business Logic (DDD)
  changePrice(newPrice: string): void {
    const priceNum = parseFloat(newPrice);
    if (priceNum < 0) {
      throw new Error('Price cannot be negative');
    }
    this.price = newPrice;
    // Here we could emit a domain event: ProductPriceChanged
  }
}
