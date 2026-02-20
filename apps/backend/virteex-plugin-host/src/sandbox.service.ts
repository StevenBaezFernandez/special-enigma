import { Injectable } from '@nestjs/common';
import * as ivm from 'isolated-vm';
import { Worker } from 'worker_threads';

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

  async runWasm(
    wasmBuffer: Buffer,
    timeout = this.DEFAULT_TIMEOUT_MS,
  ): Promise<SandboxResult> {
    const start = Date.now();

    return new Promise((resolve) => {
      const workerCode = `
        const { parentPort, workerData } = require('worker_threads');

        (async () => {
          const { wasmBuffer, timeout, startTime } = workerData;
          const logs = [];

          try {
            const importObject = {
              env: {
                log: (offset, length) => {
                   logs.push(\`Wasm log called (memory offset: \${offset}, length: \${length})\`);
                },
                abort: () => {
                   throw new Error('Wasm aborted');
                }
              }
            };

            // Reconstruct buffer from shared array buffer or cloned buffer if necessary, but workerData handles Buffer
            const module = await WebAssembly.compile(Buffer.from(wasmBuffer));
            const instance = await WebAssembly.instantiate(module, importObject);

            const exports = instance.exports;
            if (typeof exports.main === 'function') {
              const result = exports.main();
              logs.push(\`Wasm execution result: \${result}\`);
            } else {
              logs.push('No main function found in Wasm module');
            }

            parentPort.postMessage({ success: true, logs, executionTimeMs: Date.now() - startTime });

          } catch (err) {
            parentPort.postMessage({ success: false, logs, error: String(err), executionTimeMs: Date.now() - startTime });
          }
        })();
      `;

      const worker = new Worker(workerCode, {
        eval: true,
        workerData: {
          wasmBuffer,
          timeout,
          startTime: start,
        },
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
    timeout = this.DEFAULT_TIMEOUT_MS,
  ): Promise<SandboxResult> {
    let isolate: ivm.Isolate | null = null;
    let context: ivm.Context | null = null;
    const logs: string[] = [];

    const start = Date.now();

    try {
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
}
