export const SALES_PORT = 'SALES_PORT';

export interface TopProductDto {
  name: string;
  value: number;
}

export interface SalesPort {
  getTopProducts(tenantId: string, limit: number): Promise<TopProductDto[]>;
}
