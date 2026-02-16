import { Invoice } from '../entities/invoice.entity';
import { TenantFiscalConfig } from './tenant-config.port';
import { CustomerBillingInfo } from './customer.repository';

export interface FiscalDocumentBuilder {
  build(invoice: Invoice, tenantConfig: TenantFiscalConfig, customer: CustomerBillingInfo): Promise<string>;
}

export const FISCAL_DOCUMENT_BUILDER_FACTORY = 'FISCAL_DOCUMENT_BUILDER_FACTORY';

export interface FiscalDocumentBuilderFactory {
    getBuilder(country: string): FiscalDocumentBuilder;
}
