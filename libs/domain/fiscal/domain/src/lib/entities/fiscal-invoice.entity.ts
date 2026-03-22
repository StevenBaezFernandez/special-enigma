export interface FiscalInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: string;
  amount: string;
  taxAmount: string;
  productId?: string;
}

export interface FiscalInvoiceData {
  id: string;
  tenantId: string;
  customerId: string;
  issueDate: Date | string;
  dueDate: Date | string;
  totalAmount: string;
  taxAmount: string;
  items: FiscalInvoiceItem[];
  paymentForm?: string;
  paymentMethod?: string;
  usage?: string;
}
