export interface TenantDto {
  id: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PROVISIONING' | 'DEGRADED';
  mode: 'SHARED' | 'SCHEMA' | 'DATABASE';
  plan: string;
  createdAt: string;
  updatedAt: string;
  primaryRegion?: string;
  secondaryRegion?: string;
}

export interface CreateTenantRequest {
  id: string;
  name: string;
  mode: 'SHARED' | 'SCHEMA' | 'DATABASE';
  plan: string;
  country: string;
  email: string;
  taxId: string;
  primaryRegion?: string;
  secondaryRegion?: string;
}

export interface DashboardMetricsDto {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  provisioningTenants: number;
  mrr: number;
  churnRate: number;
  recentActivity: any[];
}

export interface OperationLogDto {
  id: string;
  tenantId: string;
  type: string;
  state: string;
  createdAt: string;
  result?: any;
}

export interface IncidentDto {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  service: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}
