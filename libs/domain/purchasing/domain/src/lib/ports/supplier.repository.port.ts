import { Supplier } from '../entities/supplier.entity';

export interface ISupplierRepository {
  save(supplier: Supplier): Promise<void>;
  findById(id: string): Promise<Supplier | null>;
  findByTaxId(tenantId: string, taxId: string): Promise<Supplier | null>;
}
export const SUPPLIER_REPOSITORY = 'SUPPLIER_REPOSITORY';
