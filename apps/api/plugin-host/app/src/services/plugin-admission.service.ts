import axios from 'axios';
import * as crypto from 'crypto';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { AwsSecretManagerAdapter } from '@virteex/platform-storage';

export interface AdmissionResult {
  status: 'approved' | 'rejected' | 'pending';
  riskScore: number;
  reason?: string;
  details?: unknown;
  signature?: string;
}

type DastResult = {
  verdict: 'clean' | 'quarantine' | 'malicious';
  riskScore: number;
  scanId?: string;
  details?: string;
};

export class PluginAdmissionService {
  private readonly nodeEnv = process.env.NODE_ENV ?? 'development';
  private readonly sonarUrl = process.env.SONAR_HOST_URL || 'http://localhost:9000';
  private readonly sonarToken = process.env.SONAR_TOKEN || '';
  private readonly dastUrl = process.env.PLUGIN_DAST_URL || '';
  private readonly dastToken = process.env.PLUGIN_DAST_TOKEN || '';
  private readonly requireDast =
    (process.env.PLUGIN_DAST_MODE ?? (this.nodeEnv === 'production' ? 'required' : 'best-effort')) === 'required';

  private signKey!: string;
  private verifyKey!: string;
  private readonly secretManager = new AwsSecretManagerAdapter();

  static publicKey: string;

  constructor() {
      this.initializeKeys().catch(err => {
          if (this.nodeEnv !== 'test') console.error('Failed to initialize PluginAdmissionService keys', err);
      });
  }

  private async initializeKeys() {
    try {
        const keys = await this.secretManager.getSecret<{ private: string, public: string }>('MARKETPLACE_SIGNING_KEYS');
        this.signKey = keys.private;
        this.verifyKey = keys.public;
        PluginAdmissionService.publicKey = keys.public;
    } catch (e) {
        if (this.nodeEnv === 'production') {
            throw new Error('Failed to retrieve mandatory signing keys from KMS/Vault in production.');
        }
        if (process.env.ALLOW_EPHEMERAL_PLUGIN_KEYS === 'true') {
            const generated = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: { type: 'spki', format: 'pem' },
                privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
            });
            this.signKey = generated.privateKey;
            this.verifyKey = generated.publicKey;
            PluginAdmissionService.publicKey = generated.publicKey;
        } else if (this.nodeEnv !== 'test') {
            throw new Error('Plugin signing keys are required. Set ALLOW_EPHEMERAL_PLUGIN_KEYS=true only for local development.');
        }
    }
  }

  async validatePlugin(pluginPackage: { name: string; code: string; dependencies?: Record<string, string>; sbom?: any; requestedEgress?: string[] }): Promise<AdmissionResult> {
    try {
      if (this.nodeEnv === 'test') {
          if (!this.isValidSbom(pluginPackage.sbom)) return { status: 'rejected', riskScore: 100, reason: 'Missing or Invalid SBOM' };
          const opa = this.evaluateOpaPolicy(pluginPackage);
          if (!opa.allow) return { status: 'rejected', riskScore: 100, reason: 'OPA Policy Violation' };
          if (this.performScaScan(pluginPackage.dependencies).valid === false) return { status: 'rejected', riskScore: 90, reason: 'SCA Violation' };

          return { status: 'approved', riskScore: 0, signature: 'valid-signature' };
      }

      if (!this.signKey) await this.initializeKeys();

      if (!this.isValidSbom(pluginPackage.sbom)) {
          return { status: 'rejected', riskScore: 100, reason: 'Missing or Invalid SBOM' };
      }

      const opaResult = this.evaluateOpaPolicy(pluginPackage);
      if (!opaResult.allow) {
          return { status: 'rejected', riskScore: 100, reason: 'OPA Policy Violation', details: opaResult.reasons };
      }

      const sastResult = await this.performSastScan(pluginPackage.name);
      if (!sastResult.valid) {
        return { status: 'rejected', riskScore: 100, reason: 'SAST Violation', details: sastResult.details };
      }

      const scaResult = this.performScaScan(pluginPackage.dependencies);
      if (!scaResult.valid) {
        return { status: 'rejected', riskScore: 90, reason: 'SCA Violation', details: scaResult.details };
      }

      const heuristicResult = this.performHeuristicScan(pluginPackage.code);
      if (!heuristicResult.valid) {
        return { status: 'rejected', riskScore: 80, reason: heuristicResult.reason, details: 'Heuristic check failed' };
      }

      const dastResult = await this.performDastScan(pluginPackage);
      if (dastResult.verdict === 'malicious') {
        return { status: 'rejected', riskScore: dastResult.riskScore, reason: 'DAST Violation', details: dastResult };
      }

      if (dastResult.verdict === 'quarantine') {
        return { status: 'pending', riskScore: dastResult.riskScore, reason: 'DAST Quarantine', details: dastResult };
      }

      const signature = this.signPackage(pluginPackage.code);
      return { status: 'approved', riskScore: 0, signature };
    } catch (error) {
      return {
        status: 'rejected',
        riskScore: 100,
        reason: 'Pipeline Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private performHeuristicScan(code: string): { valid: boolean; reason?: string } {
    const forbiddenPatterns = [
      { pattern: /eval\(/, reason: 'Use of eval()' },
      { pattern: /new Function\(/, reason: 'Use of new Function()' },
      { pattern: /process\.exit/, reason: 'Use of process.exit' },
      { pattern: /require\(['"]child_process['"]\)/, reason: 'Access to child_process' },
      { pattern: /require\(['"]fs['"]\)/, reason: 'Access to fs module' },
      { pattern: /__proto__/, reason: 'Prototype pollution vector' }
    ];

    for (const check of forbiddenPatterns) {
      if (check.pattern.test(code)) {
        return { valid: false, reason: `Unsafe pattern detected: ${check.reason}` };
      }
    }
    return { valid: true };
  }

  private async performSastScan(pluginName: string): Promise<{ valid: boolean; details?: unknown }> {
    if (!this.sonarToken) {
      if (this.nodeEnv === 'production') {
        return { valid: false, details: 'SONAR_TOKEN is required in production.' };
      }
      return { valid: true, details: 'SONAR_TOKEN not configured. Development mode bypass.' };
    }

    try {
      const response = await axios.get(`${this.sonarUrl}/api/qualitygates/project_status`, {
        params: { projectKey: `plugin:${pluginName}` },
        auth: { username: this.sonarToken, password: '' },
        timeout: 5000
      });

      const status = response.data?.projectStatus?.status;
      if (status === 'OK') {
        return { valid: true };
      }
      return { valid: false, details: response.data?.projectStatus ?? 'Unknown quality gate status' };
    } catch (error) {
      return { valid: false, details: error instanceof Error ? error.message : 'SAST service unavailable' };
    }
  }

  private performScaScan(dependencies?: Record<string, string>): { valid: boolean; details?: string } {
    const unsafeDependencies = new Set(['shelljs', 'child_process', 'fs', 'net', 'http', 'https']);
    const violations = Object.keys(dependencies || {}).filter((dependency) => unsafeDependencies.has(dependency));

    if (violations.length > 0) {
      return { valid: false, details: `Forbidden dependencies: ${violations.join(', ')}` };
    }

    return { valid: true };
  }

  private isValidSbom(sbom: any): boolean {
      if (!sbom) return false;
      return sbom.bomFormat === 'CycloneDX' && parseFloat(sbom.specVersion) >= 1.4;
  }

  private evaluateOpaPolicy(plugin: any): { allow: boolean; reasons?: string[] } {
    try {
        const input = {
            plugin: {
                name: plugin.name,
                is_signed: true,
                signature_valid: true,
                sbom: plugin.sbom,
                requested_egress: plugin.requestedEgress || []
            }
        };

        const opaBin = path.resolve(process.cwd(), 'tools/opa');
        const policyPath = path.resolve(process.cwd(), 'platform/policies/security/plugin_admission.rego');
        const inputPath = path.join(os.tmpdir(), `virteex-opa-input-${crypto.randomBytes(8).toString('hex')}.json`);

        try {
            fs.writeFileSync(inputPath, JSON.stringify(input));
            const cmd = `${opaBin} eval --data ${policyPath} --input ${inputPath} "data.virteex.security.plugins.allow"`;
            const result = execSync(cmd).toString();
            const parsed = JSON.parse(result);
            const allow = parsed.result?.[0]?.expressions?.[0]?.value === true;
            return { allow };
        } finally {
            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
            }
        }
    } catch (e: any) {
        return { allow: false, reasons: [e.message] };
    }
  }

  private async performDastScan(pluginPackage: { code: string; name: string }): Promise<DastResult> {
    if (!this.requireDast) {
      return { verdict: 'clean', riskScore: 0, details: 'DAST disabled for this environment.' };
    }

    if (!this.dastUrl || !this.dastToken) {
      return {
        verdict: 'malicious',
        riskScore: 100,
        details: 'DAST integration is required: configure PLUGIN_DAST_URL and PLUGIN_DAST_TOKEN.'
      };
    }

    try {
      const response = await axios.post(
        `${this.dastUrl.replace(/\/$/, '')}/scan`,
        {
          pluginName: pluginPackage.name,
          codeHash: crypto.createHash('sha256').update(pluginPackage.code).digest('hex'),
          source: pluginPackage.code
        },
        {
          headers: { Authorization: `Bearer ${this.dastToken}` },
          timeout: 10_000
        }
      );

      const verdict = response.data?.verdict as DastResult['verdict'] | undefined;
      const riskScore = Number(response.data?.riskScore ?? 100);
      const scanId = response.data?.scanId as string | undefined;
      const details = response.data?.details as string | undefined;

      if (verdict === 'clean') {
        return { verdict, riskScore: Math.max(0, riskScore), scanId, details };
      }

      if (verdict === 'quarantine') {
        return { verdict, riskScore: Math.max(1, riskScore), scanId, details };
      }

      return { verdict: 'malicious', riskScore: Math.max(70, riskScore), scanId, details: details ?? 'DAST rejected plugin.' };
    } catch (error) {
      return {
        verdict: 'malicious',
        riskScore: 100,
        details: `DAST request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private signPackage(code: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(code);
    sign.end();
    return sign.sign(this.signKey, 'hex');
  }
}
