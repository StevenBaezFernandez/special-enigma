export interface CustomerBillingInfo {
  id: string;
  rfc: string;
  legalName: string;
  taxRegimen: string;
  postalCode: string;
  email: string;
  address?: string;
  taxId: string;
}

export interface CustomerRepository {
  findById(id: string): Promise<CustomerBillingInfo | null>;
}

export const CUSTOMER_REPOSITORY = 'CUSTOMER_REPOSITORY';
