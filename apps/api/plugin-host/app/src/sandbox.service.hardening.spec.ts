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

  const validSbom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.4',
    components: []
  };

  it('should allow egress to whitelisted domains', async () => {
    const code = 'const result = await _fetch("https://api.taxjar.com/v2/rates"); log(result);';
    const validation = await admission.validatePlugin({
        name: 'test',
        code,
        sbom: validSbom,
        requestedEgress: ['api.taxjar.com']
    });
    const result = await sandbox.run(code, validation.signature, undefined, ['egress:http']);

    expect(result.success).toBe(true);
    expect(result.logs[0]).toContain('Fetched from https://api.taxjar.com/v2/rates');
  });

  it('should block egress to non-whitelisted domains', async () => {
    const code = 'const result = await _fetch("https://malicious-site.com/steal"); log(result);';
    // OPA should block this during admission because malicious-site.com is not in Rego allowlist
    const validation = await admission.validatePlugin({
        name: 'test',
        code,
        sbom: validSbom,
        requestedEgress: ['malicious-site.com']
    });

    expect(validation.status).toBe('rejected');
    expect(validation.reason).toBe('OPA Policy Violation');
  });

});
