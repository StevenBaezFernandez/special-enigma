import { Injectable, Logger } from '@nestjs/common';
import * as ivm from 'isolated-vm';
import { Worker } from 'worker_threads';
import * as path from 'path';
import * as crypto from 'crypto';
import { PluginAdmissionService } from './services/plugin-admission.service';
import { PLUGIN_POLICY } from './config/plugin-policy.config';

export interface SandboxResult {
  success: boolean;
  logs: string[];
  error?: string;
  executionTimeMs?: number;
  forensicData?: {
    code: string;
    stack?: string;
    memoryUsage?: number;
  };
}

@Injectable()
export class SandboxService {
  private readonly MEMORY_LIMIT_MB = 128;
  private readonly DEFAULT_TIMEOUT_MS = 100;
  private readonly logger = new Logger(SandboxService.name);

  async runWasm(
    wasmBuffer: Buffer,
    timeout = this.DEFAULT_TIMEOUT_MS,
  ): Promise<SandboxResult> {
    const start = Date.now();

    // Securely run WASM in a dedicated worker thread using a file, not eval
    const workerPath = path.join(__dirname, 'assets', 'plugin.worker.js');

    return new Promise((resolve) => {
      const worker = new Worker(workerPath, {
        workerData: {
          wasmBuffer,
          timeout,
          startTime: start,
        },
        resourceLimits: {
           maxOldGenerationSizeMb: this.MEMORY_LIMIT_MB,
           maxYoungGenerationSizeMb: 32,
        }
      });

      const timeoutId = setTimeout(() => {
        worker.terminate();
        resolve({
          success: false,
          logs: [],
          error: 'Execution timed out',
          executionTimeMs: timeout,
        });
      }, timeout);

      worker.on('message', (result) => {
        clearTimeout(timeoutId);
        resolve(result);
        worker.terminate();
      });

      worker.on('error', (err) => {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          logs: [],
          error: String(err),
          executionTimeMs: Date.now() - start,
        });
        worker.terminate();
      });

      worker.on('exit', (code) => {
        // If exited cleanly without message, it might be due to timeout or crash
        // If resolve was already called (e.g. by timeout), this is a no-op
      });
    });
  }

  async run(
    code: string,
    signature?: string,
    timeout = this.DEFAULT_TIMEOUT_MS,
  ): Promise<SandboxResult> {
    let isolate: ivm.Isolate | null = null;
    let context: ivm.Context | null = null;
    const logs: string[] = [];

    const start = Date.now();

    try {
      // 1. Verify Signature (Security Requirement)
      if (!this.verifyCodeSignature(code, signature)) {
          this.logger.error('Signature verification failed for plugin execution attempt.');
          return {
              success: false,
              logs: [],
              error: 'Security Error: Invalid or missing digital signature.',
              executionTimeMs: 0
          };
      }

      // Create a fresh isolate for every execution (Strict Isolation)
      isolate = new ivm.Isolate({
        memoryLimit: this.MEMORY_LIMIT_MB,
      });
      context = isolate.createContextSync();

      const jail = context.global;

      // Secure the global scope - deny default access
      jail.setSync('global', jail.derefInto());

      // Controlled Logging Interface
      jail.setSync('log', (...args: any[]) => {
        if (logs.length < 100) {
          logs.push(args.map((a) => String(a)).join(' '));
        }
      });

      // SECURITY: Egress Control / Allowlist for fetch-like requests
      jail.setSync('_fetch', (url: string) => {
          try {
              const parsedUrl = new URL(url);
              if (!PLUGIN_POLICY.egress.allowlist.includes(parsedUrl.hostname)) {
                  throw new Error(`Security Exception: Egress to ${parsedUrl.hostname} is not allowed.`);
              }
              // In a real implementation, this would call a secure internal proxy
              return `Fetched from ${url} (Simulated in sandbox)`;
          } catch (e: any) {
              throw new Error(`Invalid URL or disallowed egress: ${e.message}`);
          }
      });

      // Compile and Run
      const script = isolate.compileScriptSync(code);
      await script.run(context, {
        timeout: timeout,
        release: true,
      });

      return {
        success: true,
        logs: logs,
        executionTimeMs: Date.now() - start,
      };
    } catch (err: any) {
      const duration = Date.now() - start;
      const memoryUsage = isolate
        ? isolate.getHeapStatisticsSync().total_heap_size
        : 0;

      const forensicData = {
        code,
        stack: err?.stack || String(err),
        memoryUsage,
      };

      return {
        success: false,
        logs: logs,
        error: String(err),
        executionTimeMs: duration,
        forensicData,
      };
    } finally {
      // Cleanup
      if (context) context.release();
      if (isolate && !isolate.isDisposed) isolate.dispose();
    }
  }

  private verifyCodeSignature(code: string, signature?: string): boolean {
      if (!signature) {
          this.logger.warn('No signature provided for execution.');
          return false;
      }

      const publicKey = PluginAdmissionService.publicKey;
      if (!publicKey) {
          this.logger.error('No public key available for verification.');
          return false;
      }

      try {
          const verify = crypto.createVerify('SHA256');
          verify.update(code);
          verify.end();
          return verify.verify(publicKey, signature, 'hex');
      } catch (e) {
          this.logger.error('Signature verification error', e);
          return false;
      }
  }
}
