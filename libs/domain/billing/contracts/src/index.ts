export interface InvoiceContract {
  id: string;
  totalAmount?: string;
  taxAmount?: string;
  subTotal?: string;
  issueDate?: string;
}
export interface CustomerBillingInfoContract {
  id: string;
  legalName?: string;
  taxId?: string;
  postalCode?: string;
  address?: string;
}
