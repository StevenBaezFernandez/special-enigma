import { SandboxService } from './sandbox.service';
import { PluginAdmissionService } from './services/plugin-admission.service';

describe('SandboxService Security Hardening', () => {
  let sandbox: SandboxService;
  let admission: PluginAdmissionService;

  beforeAll(() => {
    process.env.ALLOW_EPHEMERAL_PLUGIN_KEYS = 'true';
    admission = new PluginAdmissionService();
  });

  beforeEach(() => {
    sandbox = new SandboxService();
  });

  it('should allow egress to whitelisted domains', async () => {
    const code = 'const result = _fetch("https://api.virteex.io/v1/status"); log(result);';
    const validation = await admission.validatePlugin({ name: 'test', code });
    const result = await sandbox.run(code, validation.signature);

    expect(result.success).toBe(true);
    expect(result.logs[0]).toContain('Fetched from https://api.virteex.io/v1/status');
  });

  it('should block egress to non-whitelisted domains', async () => {
    const code = 'const result = _fetch("https://malicious-site.com/steal"); log(result);';
    const validation = await admission.validatePlugin({ name: 'test', code });
    const result = await sandbox.run(code, validation.signature);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Security Exception: Egress to malicious-site.com is not allowed by policy.');
  });

});
