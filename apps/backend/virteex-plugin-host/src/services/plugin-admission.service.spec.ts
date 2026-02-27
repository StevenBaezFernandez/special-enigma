import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { PluginAdmissionService } from './plugin-admission.service';

describe('PluginAdmissionService', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('fails in production without signing keys', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.PLUGIN_SIGNING_PRIVATE_KEY;
    delete process.env.PLUGIN_SIGNING_PUBLIC_KEY;
    expect(() => new PluginAdmissionService()).toThrow(/required in production/);
  });

  it('rejects unsafe dependencies', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ALLOW_EPHEMERAL_PLUGIN_KEYS = 'true';

    const svc = new PluginAdmissionService();
    const result = await svc.validatePlugin({
      name: 'unsafe-plugin',
      code: 'log("ok")',
      dependencies: { fs: '^1.0.0' }
    });

    expect(result.status).toBe('rejected');
    expect(result.reason).toBe('SCA Violation');
  });
});
