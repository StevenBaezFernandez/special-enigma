const { parentPort, workerData } = require('worker_threads');

(async () => {
  const { wasmBuffer, timeout, startTime } = workerData;
  const logs = [];

  try {
    const importObject = {
      env: {
        log: (offset, length) => {
           logs.push(`Wasm log called (memory offset: ${offset}, length: ${length})`);
        },
        abort: () => {
           throw new Error('Wasm aborted');
        }
      }
    };

    // Instantiate WebAssembly module from buffer
    const module = await WebAssembly.compile(Buffer.from(wasmBuffer));
    const instance = await WebAssembly.instantiate(module, importObject);

    const exports = instance.exports;
    if (typeof exports.main === 'function') {
      const result = exports.main();
      logs.push(`Wasm execution result: ${result}`);
    } else {
      logs.push('No main function found in Wasm module');
    }

    parentPort.postMessage({ success: true, logs, executionTimeMs: Date.now() - startTime });

  } catch (err) {
    parentPort.postMessage({ success: false, logs, error: String(err), executionTimeMs: Date.now() - startTime });
  }
})();
