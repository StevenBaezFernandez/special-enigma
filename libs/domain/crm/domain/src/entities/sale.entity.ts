import { v4 } from 'uuid';

export enum SaleStatus {
  DRAFT = 'DRAFT',
  NEGOTIATION = 'NEGOTIATION',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export class Sale {
  id: string = v4();
  tenantId!: string;
  customerId!: string;
  customerName!: string;
  total!: string;
  status: SaleStatus = SaleStatus.DRAFT;
  items  : any[] = [];
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
  productId!: string;
  productName!: string;
  price!: string;
  quantity!: string;
  sale!: Sale;

  constructor(productId: string, productName: string, price: string, quantity: string) {
    this.productId = productId;
    this.productName = productName;
    this.price = price;
    this.quantity = quantity;
  }
}
