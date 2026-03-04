import { TenantContext } from './tenant-context.interface';

export const TENANT_CONTEXT_VERSION = 'v1' as const;

export interface SignedTenantContextClaims extends TenantContext {
  contextVersion: typeof TENANT_CONTEXT_VERSION;
  iat: number;
  exp: number;
}

export type TenantContextViolationType =
  | 'missing_context'
  | 'missing_signature'
  | 'invalid_signature'
  | 'invalid_payload'
  | 'expired_context'
  | 'invalid_claims';

export class TenantContextValidationError extends Error {
  constructor(
    public readonly violationType: TenantContextViolationType,
    message: string
  ) {
    super(message);
  }
}
