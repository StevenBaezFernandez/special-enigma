import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StepUpGuard } from './step-up.guard';
import { TelemetryService } from '@virteex/kernel-telemetry-interfaces';

describe('StepUpGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() } as any as Reflector;
  const telemetry = { recordSecurityEvent: vi.fn() } as any as TelemetryService;
  const guard = new StepUpGuard(reflector, telemetry);

  const mockContext = (user: any): ExecutionContext =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user, headers: {} }) }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext);

  beforeEach(() => {
    vi.clearAllMocks();
    reflector.getAllAndOverride = vi.fn().mockReturnValue({ action: 'billing', maxAgeSeconds: 300 });
  });

  it('allows when no step-up metadata', () => {
    reflector.getAllAndOverride = vi.fn().mockReturnValue(undefined);
    expect(guard.canActivate(mockContext({}))).toBe(true);
  });

  it('blocks without fresh MFA', () => {
    const old = Math.floor(Date.now() / 1000) - 1000;
    expect(() =>
      guard.canActivate(
        mockContext({ sub: 'u1', amr: ['pwd', 'mfa'], mfa_verified_at: old })
      )
    ).toThrow();
  });

  it('allows with recent MFA', () => {
    const fresh = Math.floor(Date.now() / 1000) - 60;
    expect(
      guard.canActivate(
        mockContext({ sub: 'u1', amr: ['pwd', 'mfa'], mfa_verified_at: fresh })
      )
    ).toBe(true);
  });
});
