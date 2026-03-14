import { SefazFiscalAdapter, UFValidationRule } from './sefaz-fiscal-provider.adapter';
import { HttpService } from '@nestjs/axios';
import * as libxmljs from 'libxmljs2';

describe('SefazFiscalAdapter Hardening', () => {
  let adapter: SefazFiscalAdapter;
  let httpService: HttpService;

  beforeEach(() => {
    httpService = {
      post: vi.fn()
    } as any;
    adapter = new SefazFiscalAdapter(httpService);
  });

  it('should call UF-specific validation if registered', async () => {
    const mockRule: UFValidationRule = {
      uf: '35', // SP
      validate: vi.fn().mockReturnValue({ isValid: false, errors: ['Invalid state data'] })
    };

    adapter.registerUfRule(mockRule);

    const xml = `
      <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
        <infNFe versao="4.00">
          <ide><cUF>35</cUF></ide>
        </infNFe>
      </NFe>
    `;

    // Bypass XSD validation for this test by mocking it if possible,
    // but here we just want to see if it reaches the UF logic if it was valid.
    // Since we don't have the real XSD in the test environment easily,
    // we might need to mock parseXml or similar if it fails earlier.

    // For now, let's assume we want to test that it THROWS when UF validation fails.
    // We'll need to mock the validate method of the document.

    const parseSpy = vi.spyOn(libxmljs, 'parseXml').mockReturnValue({
        validate: vi.fn().mockReturnValue(true),
        get: vi.fn().mockReturnValue({ text: () => '35' }),
        validationErrors: []
    } as any);

    // Mock the xsdSchema to be defined so it doesn't fail the pre-check
    (adapter as any).xsdSchema = { some: 'schema' };

    await expect(adapter.validateInvoice(xml)).rejects.toThrow('UF 35 Validation Failed: Invalid state data');
    expect(mockRule.validate).toHaveBeenCalled();

    parseSpy.mockRestore();
  });

  it('should throw error in production if certificates are missing', () => {
     process.env['NODE_ENV'] = 'production';
     delete process.env['FISCAL_PRIVATE_KEY'];

     expect(() => new SefazFiscalAdapter(httpService)).toThrow('FATAL: FISCAL_PRIVATE_KEY is mandatory for SEFAZ in production.');

     delete process.env['NODE_ENV'];
  });
});
