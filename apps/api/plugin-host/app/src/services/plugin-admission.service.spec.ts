import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { PluginAdmissionService } from './plugin-admission.service';

vi.mock('axios');

describe('PluginAdmissionService', () => {
  const originalEnv = { ...process.env };

  const validSbom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.4',
    components: []
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('rejects missing SBOM', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ALLOW_EPHEMERAL_PLUGIN_KEYS = 'true';
    const svc = new PluginAdmissionService();
    const result = await svc.validatePlugin({
      name: 'test',
      code: 'log("ok")',
    });
    expect(result.status).toBe('rejected');
    expect(result.reason).toBe('Missing or Invalid SBOM');
  });

  it('rejects unsafe dependencies', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ALLOW_EPHEMERAL_PLUGIN_KEYS = 'true';

    const svc = new PluginAdmissionService();
    const result = await svc.validatePlugin({
      name: 'unsafe-plugin',
      code: 'log("ok")',
      dependencies: { fs: '^1.0.0' },
      sbom: validSbom
    });

    expect(result.status).toBe('rejected');
    expect(result.reason).toBe('SCA Violation');
  });

  it('returns pending when DAST returns quarantine verdict', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ALLOW_EPHEMERAL_PLUGIN_KEYS = 'true';
    process.env.PLUGIN_DAST_MODE = 'required';
    process.env.PLUGIN_DAST_URL = 'https://dast.local';
    process.env.PLUGIN_DAST_TOKEN = 'token';

    vi.mocked(axios.get).mockResolvedValue({ data: { projectStatus: { status: 'OK' } } } as any);
    vi.mocked(axios.post).mockResolvedValue({
      data: { verdict: 'quarantine', riskScore: 65, scanId: 'scan-123', details: 'Suspicious network behavior' }
    } as any);

    const svc = new PluginAdmissionService();
    const result = await svc.validatePlugin({
        name: 'plugin',
        code: 'log("safe")',
        dependencies: {},
        sbom: validSbom
    });

    expect(result.status).toBe('pending');
    expect(result.reason).toBe('DAST Quarantine');
  });
});
