import { DianFiscalAdapter } from './dian-fiscal-provider.adapter';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';

vi.mock('fs');
vi.mock('path');

describe('DianFiscalAdapter', () => {
  let adapter: DianFiscalAdapter;
  let httpService: any;

  beforeEach(() => {
    httpService = {
      post: vi.fn(),
    };

    vi.spyOn(path, 'resolve').mockReturnValue('/mock/path/schema.xsd');
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue('<xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"></xsd:schema>');

    process.env['FISCAL_PRIVATE_KEY'] = 'mock-key';
    process.env['FISCAL_CERTIFICATE'] = Buffer.from('mock-cert').toString('base64');

    adapter = new DianFiscalAdapter(httpService as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env['FISCAL_PRIVATE_KEY'];
    delete process.env['FISCAL_CERTIFICATE'];
    delete process.env['NODE_ENV'];
    delete process.env['DIAN_API_URL'];
    delete process.env['DIAN_CONTINGENCY_MODE'];
  });

  describe('validateInvoice', () => {
    it('should throw error if invoice is not a string', async () => {
      await expect(adapter.validateInvoice({})).rejects.toThrow(
        'Structural validation requires XML string for DIAN production flow.'
      );
    });

    it('should throw error if invoice is null', async () => {
      await expect(adapter.validateInvoice(null)).rejects.toThrow('Invoice is null or undefined');
    });
  });

  describe('transmitInvoice', () => {
    it('should throw error if DIAN_API_URL is missing and contingency is off', async () => {
      const invoice = '<Invoice id="123"></Invoice>';
      await expect(adapter.transmitInvoice(invoice)).rejects.toThrow('DIAN_API_URL is not configured.');
    });

    it('should use contingency mode if enabled', async () => {
      process.env['DIAN_CONTINGENCY_MODE'] = 'true';
      process.env['DIAN_CONTINGENCY_PATH'] = '/tmp/contingency';

      vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);

      // Mock signInvoice to return a string
      vi.spyOn(adapter, 'signInvoice').mockResolvedValue('<SignedInvoice/>');

      const invoice = { id: 'INV-123' };
      await adapter.transmitInvoice(invoice);

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('/tmp/contingency/INV-123-'),
        '<SignedInvoice/>'
      );
    });

    it('should transmit via SOAP if API URL is provided', async () => {
      process.env['DIAN_API_URL'] = 'https://api.dian.gov.co';
      const invoice = '<Invoice id="123"></Invoice>';

      vi.spyOn(adapter, 'signInvoice').mockResolvedValue('<SignedInvoice/>');
      httpService.post.mockReturnValue(of({ status: 200, data: '<b:Success>true</b:Success>' }));

      await adapter.transmitInvoice(invoice);

      expect(httpService.post).toHaveBeenCalledWith(
        'https://api.dian.gov.co',
        expect.stringContaining('<wcf:SendBillAsync>'),
        expect.any(Object)
      );
    });

    it('should throw error if DIAN returns non-success response', async () => {
        process.env['DIAN_API_URL'] = 'https://api.dian.gov.co';
        const invoice = '<Invoice id="123"></Invoice>';

        vi.spyOn(adapter, 'signInvoice').mockResolvedValue('<SignedInvoice/>');
        httpService.post.mockReturnValue(of({ status: 200, data: '<b:Success>false</b:Success>' }));

        await expect(adapter.transmitInvoice(invoice)).rejects.toThrow(
          'DIAN Rejected Invoice or returned unrecognized response.'
        );
    });
  });
});
