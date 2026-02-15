export interface TenantFiscalConfig {
  rfc: string;
  csdCertificate?: string;
  csdKey?: string;
}

export interface TenantConfigRepository {
  getFiscalConfig(tenantId: string): Promise<TenantFiscalConfig>;
}

export const TENANT_CONFIG_REPOSITORY = 'TENANT_CONFIG_REPOSITORY';
