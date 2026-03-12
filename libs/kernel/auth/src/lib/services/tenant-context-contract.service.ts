import { createHmac, timingSafeEqual } from 'crypto';
import { JwtPayload } from 'jsonwebtoken';
import {
  SignedTenantContextClaims,
  TENANT_CONTEXT_VERSION,
  TenantContextValidationError,
} from '@virteex/kernel-tenant-context';

const REQUIRED_STRING_CLAIMS: Array<keyof SignedTenantContextClaims> = [
  'tenantId',
  'userId',
  'region',
  'currency',
  'language',
  'taxJurisdiction',
  'complianceProfile',
  'requestId',
  'provenance',
  'contextVersion',
];

export const buildSignedContextClaims = (claims: Partial<SignedTenantContextClaims>): SignedTenantContextClaims => {
  const now = Math.floor(Date.now() / 1000);
  return {
    tenantId: claims.tenantId ?? '',
    userId: claims.userId ?? 'system',
    role: claims.role ?? [],
    permissions: claims.permissions ?? [],
    region: claims.region ?? 'US',
    currency: claims.currency ?? 'USD',
    language: claims.language ?? 'en',
    taxJurisdiction: claims.taxJurisdiction ?? 'US',
    complianceProfile: claims.complianceProfile ?? 'default',
    requestId: claims.requestId ?? 'unknown',
    provenance: claims.provenance ?? 'unknown',
    contextVersion: TENANT_CONTEXT_VERSION,
    iat: claims.iat ?? now,
    exp: claims.exp ?? now + 15 * 60,
  };
};

export const encodeContextClaims = (claims: SignedTenantContextClaims): string =>
  Buffer.from(JSON.stringify(claims), 'utf8').toString('base64');

export const signEncodedContext = (encodedContext: string, hmacSecret: string): string =>
  createHmac('sha256', hmacSecret).update(encodedContext).digest('hex');

export const verifySignature = (encodedContext: string, signature: string, hmacSecret: string): boolean => {
  const expected = signEncodedContext(encodedContext, hmacSecret);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
};

export const parseAndValidateSignedContext = (
  encodedContext: string | undefined,
  signature: string | undefined,
  hmacSecret: string,
  nowEpochSeconds = Math.floor(Date.now() / 1000)
): SignedTenantContextClaims => {
  if (!encodedContext) {
    throw new TenantContextValidationError('missing_context', 'Missing x-virteex-context header.');
  }

  if (!signature) {
    throw new TenantContextValidationError('missing_signature', 'Missing x-virteex-signature header.');
  }

  if (!verifySignature(encodedContext, signature, hmacSecret)) {
    throw new TenantContextValidationError('invalid_signature', 'Invalid x-virteex-signature value.');
  }

  let parsed: SignedTenantContextClaims;
  try {
    parsed = JSON.parse(Buffer.from(encodedContext, 'base64').toString('utf8')) as SignedTenantContextClaims;
  } catch {
    throw new TenantContextValidationError('invalid_payload', 'Malformed x-virteex-context payload.');
  }

  validateClaims(parsed, nowEpochSeconds);

  return parsed;
};

export const claimsFromJwtPayload = (payload: JwtPayload): SignedTenantContextClaims => {
  const claims = buildSignedContextClaims({
    tenantId: String(payload['tenantId'] ?? ''),
    userId: String(payload.sub ?? ''),
    role: Array.isArray(payload['roles']) ? (payload['roles'] as string[]) : [],
    permissions: Array.isArray(payload['permissions']) ? (payload['permissions'] as string[]) : [],
    region: String(payload['region'] ?? 'US'),
    currency: String(payload['currency'] ?? 'USD'),
    language: String(payload['language'] ?? 'en'),
    taxJurisdiction: String(payload['taxJurisdiction'] ?? 'US'),
    complianceProfile: String(payload['complianceProfile'] ?? 'default'),
    requestId: String(payload['requestId'] ?? payload.jti ?? 'unknown'),
    provenance: String(payload['provenance'] ?? 'jwt-ingress'),
    iat: Number(payload.iat ?? 0),
    exp: Number(payload.exp ?? 0),
  });

  validateClaims(claims, Math.floor(Date.now() / 1000));

  return claims;
};

export const validateClaims = (claims: SignedTenantContextClaims, nowEpochSeconds: number): void => {
  for (const claim of REQUIRED_STRING_CLAIMS) {
    if (!claims[claim] || typeof claims[claim] !== 'string') {
      throw new TenantContextValidationError('invalid_claims', `Missing or invalid claim: ${String(claim)}.`);
    }
  }

  if (!Array.isArray(claims.role)) {
    throw new TenantContextValidationError('invalid_claims', 'Claim role must be a string array.');
  }

  if (claims.contextVersion !== TENANT_CONTEXT_VERSION) {
    throw new TenantContextValidationError('invalid_claims', 'Unsupported tenant context version.');
  }

  if (!claims.exp || claims.exp <= nowEpochSeconds) {
    throw new TenantContextValidationError('expired_context', 'Tenant context has expired.');
  }

  if (!claims.iat || claims.iat > nowEpochSeconds + 60) {
    throw new TenantContextValidationError('invalid_claims', 'Claim iat is invalid for tenant context.');
  }
};
