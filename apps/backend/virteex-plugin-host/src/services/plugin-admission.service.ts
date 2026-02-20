import axios from 'axios';

export interface AdmissionResult {
  status: 'approved' | 'rejected' | 'pending';
  riskScore: number;
  reason?: string;
  details?: any;
}

export class PluginAdmissionService {
  private readonly sonarUrl = process.env.SONAR_HOST_URL || 'http://localhost:9000';
  private readonly sonarToken = process.env.SONAR_TOKEN || '';
  private readonly snykUrl = process.env.SNYK_API_URL || 'https://api.snyk.io/v1';

  async validatePlugin(pluginPackage: { name: string; code: string; dependencies?: Record<string, string> }): Promise<AdmissionResult> {
    console.log(`[Admission] Starting validation pipeline for ${pluginPackage.name}...`);

    try {
      // 1. Static Application Security Testing (SAST)
      const sastResult = await this.performSastScan(pluginPackage);
      if (!sastResult.valid) {
        return { status: 'rejected', riskScore: 100, reason: 'SAST Violation', details: sastResult.details };
      }

      // 2. Software Composition Analysis (SCA)
      const scaResult = await this.performScaScan(pluginPackage);
      if (!scaResult.valid) {
        return { status: 'rejected', riskScore: 90, reason: 'SCA Violation', details: scaResult.details };
      }

      // 3. Metadata & Heuristic Validation
      if (pluginPackage.code.includes('eval(') || pluginPackage.code.includes('Function(')) {
         return { status: 'rejected', riskScore: 80, reason: 'Unsafe functions detected (eval/Function)', details: 'Heuristic check failed' };
      }

      return { status: 'approved', riskScore: 0 };

    } catch (error) {
      console.error('[Admission] Pipeline error:', error);
      // Fail secure
      return { status: 'rejected', riskScore: 100, reason: 'Pipeline Error', details: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async performSastScan(pluginPackage: any): Promise<{ valid: boolean; details?: any }> {
    if (!this.sonarToken) {
       console.warn('[SAST] SONAR_TOKEN missing. Skipping real scan (Development Mode).');
       return { valid: true };
    }

    // Simulate flow: Create Project -> Analyze -> Check Quality Gate
    try {
        const projectKey = `plugin:${pluginPackage.name}`;

        // Check Quality Gate Status
        const response = await axios.get(`${this.sonarUrl}/api/qualitygates/project_status`, {
            params: { projectKey },
            auth: { username: this.sonarToken, password: '' },
            timeout: 5000
        });

        const status = response.data.projectStatus.status;
        if (status === 'OK') {
            return { valid: true };
        }
        return { valid: false, details: response.data.projectStatus };

    } catch (error) {
        // Handle 404 (project not found) or connection error
        console.error('[SAST] Scan check failed:', error);
        return { valid: false, details: 'SAST Service Unavailable or Project Not Found' };
    }
  }

  private async performScaScan(pluginPackage: any): Promise<{ valid: boolean; details?: any }> {
    // Basic dependency check logic
    const unsafeDependencies = ['shelljs', 'child_process', 'fs', 'net'];
    const dependencies = Object.keys(pluginPackage.dependencies || {});

    const violations = dependencies.filter(dep => unsafeDependencies.includes(dep));

    if (violations.length > 0) {
        return { valid: false, details: `Forbidden dependencies: ${violations.join(', ')}` };
    }

    return { valid: true };
  }
}
