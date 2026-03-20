import { MockFiscalProvider } from './mock-fiscal-provider.adapter';

describe('MockFiscalProvider Hardening', () => {
  it('should throw fatal error in production mode', () => {
    process.env['NODE_ENV'] = 'production';
    expect(() => new MockFiscalProvider()).toThrow('FATAL: MockFiscalProvider attempt in PRODUCTION. Security gate violation.');
    delete process.env['NODE_ENV'];
  });

  it('should NOT throw in development mode', () => {
    process.env['NODE_ENV'] = 'development';
    expect(() => new MockFiscalProvider()).not.toThrow();
    delete process.env['NODE_ENV'];
  });
});
