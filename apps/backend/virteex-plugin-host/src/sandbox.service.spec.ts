import { SandboxService } from './sandbox.service';

describe('SandboxService', () => {
  let sandbox: SandboxService;

  beforeEach(() => {
    sandbox = new SandboxService();
  });

  afterEach(() => {
    // SandboxService is stateless and does not expose dispose()
  });

  it('should execute valid code', async () => {
    const result = await sandbox.run('const a = 1; const b = 2;');
    expect(result.success).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    const result = await sandbox.run('throw new Error("Boom");');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Boom');
    expect(result.forensicData).toBeDefined();
  });

  it('should timeout infinite loops', async () => {
    const result = await sandbox.run('while(true) {}', 50); // Short timeout
    expect(result.success).toBe(false);
    expect(result.error).toContain('timed out');
    expect(result.forensicData).toBeDefined();
  });

  it('should run valid wasm in worker', async () => {
    const wasmBuffer = Buffer.from([
      0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, // Magic + Version
      0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7f,       // Type: () -> i32
      0x03, 0x02, 0x01, 0x00,                         // Func: type 0
      0x07, 0x08, 0x01, 0x04, 0x6d, 0x61, 0x69, 0x6e, 0x00, 0x00, // Export "main"
      0x0a, 0x06, 0x01, 0x04, 0x00, 0x41, 0x2a, 0x0b  // Code: i32.const 42
    ]);
    const result = await sandbox.runWasm(wasmBuffer, 5000);
    expect(result.success).toBe(true);
    expect(result.logs.some(l => l.includes('42'))).toBe(true);
  }, 10000);
});
