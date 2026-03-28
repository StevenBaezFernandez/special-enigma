export interface BillingProduct {
  id: string;
  name: string;
  price: number;
  taxGroup?: string;
  fiscalCode?: string;
}

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';

export interface ProductRepository {
  findById(id: string): Promise<BillingProduct | null>;
}
