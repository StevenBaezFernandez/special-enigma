export enum TenantMode {
  SHARED = 'SHARED',
  SCHEMA = 'SCHEMA',
  DATABASE = 'DATABASE',
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PROVISIONING = 'PROVISIONING',
  DEGRADED = 'DEGRADED',
}

export enum OperationType {
  PROVISION = 'PROVISION',
  MIGRATE = 'MIGRATE',
  FAILOVER = 'FAILOVER',
  ROLLBACK = 'ROLLBACK',
}

export enum OperationState {
  REQUESTED = 'requested',
  PREPARING = 'preparing',
  VALIDATING = 'validating',
  SWITCHED = 'switched',
  MONITORING = 'monitoring',
  FINALIZED = 'finalized',
  ROLLBACK = 'rollback',
}

export interface TenantConfig {
  mode: TenantMode;
  connectionString?: string;
  schemaName?: string;
  tenantId: string;
  primaryRegion?: string;
  secondaryRegion?: string;
  settings?: Record<string, any>;
}
