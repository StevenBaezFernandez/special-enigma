import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
export class Product {
  id!: number;

  @Property()
  tenantId!: string; // Managed by TenantSubscriber, not by user

  sku!: string;

  @Property()
  name!: string;

  price!: string;

  fiscalCode?: string; // NCM/HS Code

  taxGroup?: string;

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
