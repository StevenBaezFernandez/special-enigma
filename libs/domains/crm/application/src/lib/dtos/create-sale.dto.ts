export interface CreateSaleDto {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  tenantId: string;
  warehouseId?: string;
}
