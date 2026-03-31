export class Payment {
  id!: string;
  tenantId!: string;
  invoiceId!: string;
  amount!: string;
  paymentDate!: Date;
  reference!: string;
  method!: string; // BANK_TRANSFER, CASH, etc.

  constructor(tenantId: string, invoiceId: string, amount: string, paymentDate: Date) {
    this.tenantId = tenantId;
    this.invoiceId = invoiceId;
    this.amount = amount;
    this.paymentDate = paymentDate;
  }
}
