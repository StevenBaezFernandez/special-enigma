import { Sale } from '../entities/sale.entity';

export interface SaleRepository {
  create(sale: Sale): Promise<Sale>;
  findById(id: string): Promise<Sale | null>;
  findAll(tenantId: string): Promise<Sale[]>;
  update(sale: Sale): Promise<Sale>;
  getTopProducts(tenantId: string, limit: number): Promise<{ name: string; value: number }[]>;
}
