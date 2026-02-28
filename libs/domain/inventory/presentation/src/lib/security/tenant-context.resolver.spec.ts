import { BadRequestException } from '@nestjs/common';
import { UserPayload } from '@virteex/kernel-auth';
import { resolveTenantId } from './tenant-context.resolver';

describe('resolveTenantId', () => {
  it('returns tenant id from authenticated payload', () => {
    const user = { tenantId: 'tenant-1' } as UserPayload;
    expect(resolveTenantId(user)).toBe('tenant-1');
  });

  it('throws when tenant id is missing', () => {
    const user = { tenantId: undefined } as unknown as UserPayload;
    expect(() => resolveTenantId(user)).toThrow(BadRequestException);
  });
});
