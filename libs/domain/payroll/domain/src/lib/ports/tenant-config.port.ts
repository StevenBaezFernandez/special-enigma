export interface TenantFiscalConfig {
  rfc: string;
  country: string;
  csdCertificate?: string;
  csdKey?: string;
}

export interface TenantConfigRepository {
  getFiscalConfig(tenantId: string): Promise<TenantFiscalConfig>;
}

export const TENANT_CONFIG_REPOSITORY = 'PAYROLL_TENANT_CONFIG_REPOSITORY';
