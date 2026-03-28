export interface InvoiceContract {
  id: string;
  tenantId: string;
  customerId: string;
  issueDate: Date;
  totalAmount: string;
  taxAmount: string;
  subTotal?: string;
  status: string;
  fiscalUuid?: string;
  xmlContent?: string;
}

export interface CustomerBillingInfoContract {
  id: string;
  email: string;
  taxId: string;
  legalName: string;
  address?: string;
  regime?: string;
  postalCode: string;
  country: string;
}
