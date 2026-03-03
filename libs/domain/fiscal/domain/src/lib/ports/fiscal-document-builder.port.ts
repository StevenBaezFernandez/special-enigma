import { InvoiceContract, CustomerBillingInfoContract } from '@virteex/domain-billing-contracts';
import { TenantFiscalConfig } from './tenant-config.port';

export interface HardwareTokenInfo {
    id: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
}

export interface HardwareTokenPort {
    isAvailable(): Promise<boolean>;
    listAvailableTokens(): Promise<HardwareTokenInfo[]>;
    signData(tokenId: string, pin: string, data: string): Promise<string>;
    getCertificate(tokenId: string): Promise<string>;
}

export const HARDWARE_TOKEN_PORT = 'HARDWARE_TOKEN_PORT';

export interface FiscalDocumentBuilder {
  build(invoice: InvoiceContract, tenantConfig: TenantFiscalConfig, customer: CustomerBillingInfoContract): Promise<string>;
}

export const FISCAL_DOCUMENT_BUILDER_FACTORY = 'FISCAL_DOCUMENT_BUILDER_FACTORY';

export interface FiscalDocumentBuilderFactory {
    getBuilder(country: string): FiscalDocumentBuilder;
}
