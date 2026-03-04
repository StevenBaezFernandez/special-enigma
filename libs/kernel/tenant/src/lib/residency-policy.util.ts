import { TenantConfig } from './interfaces/tenant-config.interface';

export type ResidencyResource = 'database' | 'queue' | 'storage' | 'replication';

export interface CentralResidencyPolicy {
  tenantId: string;
  homeRegion: string;
  resources: Record<ResidencyResource, string[]>;
  replication: {
    allowedTargets: string[];
    requireAudit: boolean;
    requiredRoles: string[];
    masking: {
      enabled: boolean;
      piiFields: string[];
    };
  };
}

const DEFAULT_PII_FIELDS = ['email', 'phone', 'address', 'taxId', 'document', 'ssn', 'card', 'token', 'secret'];

export function buildCentralResidencyPolicy(tenantId: string, config: TenantConfig): CentralResidencyPolicy {
  const homeRegion =
    config.settings?.['allowedRegion'] ||
    config.primaryRegion ||
    process.env['AWS_REGION'] ||
    'us-east-1';

  const raw = (config.settings?.['residencyPolicy'] as Partial<CentralResidencyPolicy> | undefined) || {};
  const resourceDefaults = [homeRegion];

  return {
    tenantId,
    homeRegion,
    resources: {
      database: raw.resources?.database || resourceDefaults,
      queue: raw.resources?.queue || resourceDefaults,
      storage: raw.resources?.storage || resourceDefaults,
      replication: raw.resources?.replication || [homeRegion],
    },
    replication: {
      allowedTargets: raw.replication?.allowedTargets || raw.resources?.replication || [homeRegion],
      requireAudit: raw.replication?.requireAudit ?? true,
      requiredRoles: raw.replication?.requiredRoles || ['security-admin', 'platform-sre'],
      masking: {
        enabled: raw.replication?.masking?.enabled ?? true,
        piiFields: raw.replication?.masking?.piiFields || DEFAULT_PII_FIELDS,
      },
    },
  };
}

export function isRegionAllowed(policy: CentralResidencyPolicy, resource: ResidencyResource, region: string): boolean {
  const allowed = policy.resources[resource] || [];
  return allowed.includes(region);
}

export function maskPiiPayload(payload: unknown, piiFields: string[]): unknown {
  if (payload === null || payload === undefined) return payload;

  if (Array.isArray(payload)) {
    return payload.map((item) => maskPiiPayload(item, piiFields));
  }

  if (typeof payload !== 'object') return payload;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    const lower = key.toLowerCase();
    if (piiFields.some((field) => lower.includes(field.toLowerCase()))) {
      result[key] = '[MASKED_FOR_CROSS_REGION_REPLICATION]';
      continue;
    }

    result[key] = maskPiiPayload(value, piiFields);
  }
  return result;
}
