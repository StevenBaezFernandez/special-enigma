export interface TenantFiscalConfig {
  rfc: string;
  country: string;
  csdCertificate?: string;
  csdKey?: string;
  certificateNumber?: string;
  legalName: string;
  regime: string;
  postalCode: string;
}

export interface TenantConfigRepository {
  getFiscalConfig(tenantId: string): Promise<TenantFiscalConfig>;
}

export const TENANT_CONFIG_REPOSITORY = 'TENANT_CONFIG_REPOSITORY';
