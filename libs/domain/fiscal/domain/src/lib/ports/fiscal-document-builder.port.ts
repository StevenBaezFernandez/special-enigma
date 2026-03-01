import { InvoiceContract, CustomerBillingInfoContract } from '@virteex/domain-billing-contracts';
import { TenantFiscalConfig } from './tenant-config.port';

export interface FiscalDocumentBuilder {
  build(invoice: InvoiceContract, tenantConfig: TenantFiscalConfig, customer: CustomerBillingInfoContract): Promise<string>;
}

export const FISCAL_DOCUMENT_BUILDER_FACTORY = 'FISCAL_DOCUMENT_BUILDER_FACTORY';

export interface FiscalDocumentBuilderFactory {
    getBuilder(country: string): FiscalDocumentBuilder;
}
