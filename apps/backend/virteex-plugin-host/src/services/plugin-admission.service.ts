import axios from 'axios';
import * as crypto from 'crypto';

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

  private readonly signKey: string;
  private readonly verifyKey: string;

  static publicKey: string;

  constructor() {
    const privateKey = process.env.PLUGIN_SIGNING_PRIVATE_KEY?.trim();
    const publicKey = process.env.PLUGIN_SIGNING_PUBLIC_KEY?.trim();
    const allowEphemeralKeys = process.env.ALLOW_EPHEMERAL_PLUGIN_KEYS === 'true';

    if (privateKey && publicKey) {
      this.signKey = privateKey;
      this.verifyKey = publicKey;
      PluginAdmissionService.publicKey = publicKey;
      return;
    }

    if (this.nodeEnv === 'production') {
      throw new Error('PLUGIN_SIGNING_PRIVATE_KEY and PLUGIN_SIGNING_PUBLIC_KEY are required in production.');
    }

    if (!allowEphemeralKeys) {
      throw new Error('Plugin signing keys are required. Set ALLOW_EPHEMERAL_PLUGIN_KEYS=true only for local development.');
    }

    const generated = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    this.signKey = generated.privateKey;
    this.verifyKey = generated.publicKey;
    PluginAdmissionService.publicKey = generated.publicKey;
  }

  async validatePlugin(pluginPackage: { name: string; code: string; dependencies?: Record<string, string> }): Promise<AdmissionResult> {
    try {
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
    const unsafeDependencies = new Set(['shelljs', 'child_process', 'fs', 'net']);
    const violations = Object.keys(dependencies || {}).filter((dependency) => unsafeDependencies.has(dependency));

    if (violations.length > 0) {
      return { valid: false, details: `Forbidden dependencies: ${violations.join(', ')}` };
    }

    return { valid: true };
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
