import { describe, expect, it, vi } from 'vitest';
import { IdentityResolver } from './identity.resolver';

describe('IdentityResolver', () => {
  it('forwards initiateSignup input contract directly into use case', async () => {
    const initiateSignupUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
    const resolver = new IdentityResolver(
      { execute: vi.fn() } as any,
      initiateSignupUseCase as any,
      { execute: vi.fn() } as any,
      { execute: vi.fn() } as any
    );

    const input = { email: 'test@virteex.com', password: 'super-secret-password' };
    const result = await resolver.initiateSignup(input as any);

    expect(initiateSignupUseCase.execute).toHaveBeenCalledWith(input);
    expect(result).toEqual({ success: true, message: 'Verification code sent' });
  });
});
