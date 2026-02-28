import { Invoice } from '../entities/invoice.entity';

export const INVOICE_REPOSITORY = 'INVOICE_REPOSITORY';

export interface InvoiceRepository {
  save(invoice: Invoice): Promise<void>;
  findById(id: string): Promise<Invoice | null>;
  findAll(): Promise<Invoice[]>;
  findByTenantId(tenantId: string): Promise<Invoice[]>;
  countByTenantId(tenantId: string): Promise<number>;
}
