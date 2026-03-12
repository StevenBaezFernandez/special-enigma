import { SecretManagerService } from './secret-manager.service';
import { SecretProvider } from '../interfaces/secret-provider.interface';
import { TelemetryService } from '@virteex/kernel-telemetry-interfaces';

describe('SecretManagerService Hardening', () => {
  let provider: SecretProvider;
  let telemetry: TelemetryService;

  beforeEach(() => {
    provider = {
      getSecret: vi.fn(),
    };
    telemetry = {
        recordSecurityEvent: vi.fn(),
        recordBusinessMetric: vi.fn(),
        recordInvoiceEmitted: vi.fn(),
        recordPaymentProcessed: vi.fn(),
        setTraceAttributes: vi.fn()
    };
  });

  it('should throw fatal error in production if JWT_SECRET is missing', () => {
    process.env['NODE_ENV'] = 'production';
    (provider.getSecret as any).mockReturnValue(null);

    expect(() => new SecretManagerService(provider, telemetry)).toThrow('FATAL: JWT_SECRET not found in production environment!');
    delete process.env['NODE_ENV'];
  });

  it('should generate ephemeral secret in development if JWT_SECRET is missing', () => {
    process.env['NODE_ENV'] = 'development';
    (provider.getSecret as any).mockReturnValue(null);

    const service = new SecretManagerService(provider, telemetry);
    expect(service.getJwtSecret()).toBeDefined();
    expect(service.getJwtSecret().length).toBeGreaterThan(0);
    delete process.env['NODE_ENV'];
  });

  it('should throw fatal error in production if generic secret is missing and no default provided', () => {
    process.env['NODE_ENV'] = 'production';
    (provider.getSecret as any).mockImplementation((key: string) => {
        if (key === 'JWT_SECRET') return 'some-secret';
        return null;
    });

    const service = new SecretManagerService(provider, telemetry);
    expect(() => service.getSecret('SOME_MISSING_SECRET')).toThrow('FATAL: Secret SOME_MISSING_SECRET not found in production.');
    delete process.env['NODE_ENV'];
  });

  it('should return default value in production if provided even if secret is missing', () => {
    process.env['NODE_ENV'] = 'production';
    (provider.getSecret as any).mockImplementation((key: string) => {
        if (key === 'JWT_SECRET') return 'some-secret';
        return null;
    });

    const service = new SecretManagerService(provider, telemetry);
    expect(service.getSecret('SOME_MISSING_SECRET', 'my-default')).toBe('my-default');
    delete process.env['NODE_ENV'];
  });
});
