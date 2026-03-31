export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export class Invoice {
  id!: string;
  tenantId!: string;
  vendorId?: string;
  customerId?: string;
  number!: string;
  issueDate!: Date;
  dueDate!: Date;
  currency!: string;
  amount!: string;
  status: InvoiceStatus = InvoiceStatus.DRAFT;
  type: 'PAYABLE' | 'RECEIVABLE';

  constructor(tenantId: string, number: string, type: 'PAYABLE' | 'RECEIVABLE') {
    this.tenantId = tenantId;
    this.number = number;
    this.type = type;
  }
}
