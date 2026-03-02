import { DianFiscalAdapter } from './dian-fiscal-provider.adapter';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('DianFiscalAdapter Hardening', () => {
  let adapter: DianFiscalAdapter;
  let httpService: HttpService;

  beforeEach(() => {
    httpService = {
      post: vi.fn()
    } as any;
  });

  it('should throw error in production if FISCAL_CERT_SERIAL_NUMBER is DEV placeholder', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['FISCAL_PRIVATE_KEY'] = 'fake-key';
    process.env['FISCAL_CERTIFICATE'] = Buffer.from('fake-cert').toString('base64');
    process.env['FISCAL_CERT_SERIAL_NUMBER'] = 'DEV-SERIAL-12345';
    process.env['FISCAL_POLICY_HASH'] = 'VALID-HASH';

    adapter = new DianFiscalAdapter(httpService);

    await expect(adapter.signInvoice(' <Invoice></Invoice>')).rejects.toThrow(
      'FATAL: Valid FISCAL_CERT_SERIAL_NUMBER is mandatory for DIAN in production.'
    );
  });

  it('should throw error in production if FISCAL_POLICY_HASH is DEV placeholder', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['FISCAL_PRIVATE_KEY'] = 'fake-key';
    process.env['FISCAL_CERTIFICATE'] = Buffer.from('fake-cert').toString('base64');
    process.env['FISCAL_CERT_SERIAL_NUMBER'] = 'VALID-SERIAL';
    process.env['FISCAL_POLICY_HASH'] = 'DEV-POLICY-HASH';

    adapter = new DianFiscalAdapter(httpService);

    await expect(adapter.signInvoice('<Invoice></Invoice>')).rejects.toThrow(
      'FATAL: Valid FISCAL_POLICY_HASH is mandatory for DIAN in production.'
    );
  });

  afterEach(() => {
    delete process.env['NODE_ENV'];
    delete process.env['FISCAL_PRIVATE_KEY'];
    delete process.env['FISCAL_CERTIFICATE'];
    delete process.env['FISCAL_CERT_SERIAL_NUMBER'];
    delete process.env['FISCAL_POLICY_HASH'];
  });
});
