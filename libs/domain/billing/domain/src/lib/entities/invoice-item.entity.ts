import { v4 } from 'uuid';

export class InvoiceItem {
  id: string = v4();
  description!: string;
  quantity!: number;
  unitPrice!: string;
  amount!: string;
  taxAmount!: string;
  productId?: string;

  constructor(description: string, quantity: number, unitPrice: string, amount: string, taxAmount: string) {
    this.description = description;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.amount = amount;
    this.taxAmount = taxAmount;
  }
}
