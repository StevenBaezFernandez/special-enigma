import { Invoice } from '@virteex/domain-billing-domain';
import { CustomerBillingInfo } from '@virteex/domain-billing-domain';
import { TenantFiscalConfig } from './tenant-config.port';

export interface FiscalDocumentBuilder {
  build(invoice: Invoice, tenantConfig: TenantFiscalConfig, customer: CustomerBillingInfo): Promise<string>;
}

export const FISCAL_DOCUMENT_BUILDER_FACTORY = 'FISCAL_DOCUMENT_BUILDER_FACTORY';

export interface FiscalDocumentBuilderFactory {
    getBuilder(country: string): FiscalDocumentBuilder;
}
