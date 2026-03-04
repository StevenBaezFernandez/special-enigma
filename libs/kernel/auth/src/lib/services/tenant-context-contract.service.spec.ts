import { describe, expect, it } from 'vitest';
import {
  buildSignedContextClaims,
  encodeContextClaims,
  parseAndValidateSignedContext,
  signEncodedContext,
} from './tenant-context-contract.service';

describe('tenant context contract', () => {
  it('validates a signed context envelope', () => {
    const claims = buildSignedContextClaims({ tenantId: 'tenant-1', userId: 'user-1', requestId: 'req-1' });
    const encoded = encodeContextClaims(claims);
    const signature = signEncodedContext(encoded, 'secret');

    const parsed = parseAndValidateSignedContext(encoded, signature, 'secret');

    expect(parsed.tenantId).toBe('tenant-1');
    expect(parsed.contextVersion).toBe('v1');
  });

  it('rejects missing signature', () => {
    const claims = buildSignedContextClaims({ tenantId: 'tenant-1', userId: 'user-1', requestId: 'req-1' });
    const encoded = encodeContextClaims(claims);

    expect(() => parseAndValidateSignedContext(encoded, undefined, 'secret')).toThrowError(/Missing x-virteex-signature/i);
  });
});
