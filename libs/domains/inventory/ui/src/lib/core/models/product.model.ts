export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  stock: number;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}
