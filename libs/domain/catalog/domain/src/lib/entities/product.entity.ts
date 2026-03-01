export class Product {
  id!: number;

  tenantId!: string; // Managed by TenantSubscriber, not by user

  sku!: string;

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
