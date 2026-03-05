export interface TenantContext {
  tenantId: string;
  userId: string;
  role: string[];
  permissions?: string[];
  region?: string;
  currency?: string;
  language?: string;
  taxJurisdiction?: string;
  complianceProfile?: string;
  requestId?: string;
  provenance?: string;
  signature?: string;
  exp?: number;
  iat?: number;
  contextVersion?: string;
}
