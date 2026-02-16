import { Test, TestingModule } from '@nestjs/testing';
import { FiscalStampingService } from './fiscal-stamping.service';
import { PAC_STRATEGY_FACTORY } from '../ports/pac-strategy.factory';
import { TENANT_CONFIG_REPOSITORY } from '../ports/tenant-config.port';
import { CUSTOMER_REPOSITORY } from '../ports/customer.repository';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { XsltService } from '@virteex/shared-infrastructure-xslt';
import * as crypto from 'crypto';

describe('FiscalStampingService', () => {
  let service: FiscalStampingService;
  let xsltService: XsltService;

  // Mock Dependencies
  const mockPacFactory = { getProvider: jest.fn() };
  const mockTenantRepo = { getFiscalConfig: jest.fn() };
  const mockCustomerRepo = { findById: jest.fn() };

  const mockChain = '||CADENA|ORIGINAL|TEST||';
  const mockXsltService = {
      transform: jest.fn().mockResolvedValue(mockChain)
  };

  // Generate Key Pair for testing
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiscalStampingService,
        { provide: PAC_STRATEGY_FACTORY, useValue: mockPacFactory },
        { provide: TENANT_CONFIG_REPOSITORY, useValue: mockTenantRepo },
        { provide: CUSTOMER_REPOSITORY, useValue: mockCustomerRepo },
        { provide: XsltService, useValue: mockXsltService }
      ],
    }).compile();

    service = module.get<FiscalStampingService>(FiscalStampingService);
    xsltService = module.get<XsltService>(XsltService);
  });

  it('should generate valid signed XML using XSLT service', async () => {
    // Setup Data
    const invoice = new Invoice('tenant1', 'cust1', '0', '0');
    invoice.id = '12345678-uuid';
    invoice.paymentForm = '03';
    invoice.paymentMethod = 'PUE';
    invoice.usage = 'G03';
    invoice.totalAmount = '116.00';
    invoice.taxAmount = '16.00';

    const item = new InvoiceItem(invoice, 'Product 1', 1, '100.00', '100.00', '16.00');
    // invoice.items.add(item); // Fails without ORM
    (invoice.items as any) = { getItems: () => [item] };

    const tenantConfig = {
        rfc: 'AAA010101AAA',
        country: 'MX',
        legalName: 'Test Company',
        regime: '601',
        postalCode: '12345',
        certificateNumber: '00001000000500000000',
        csdCertificate: 'BASE64CERT',
        csdKey: privateKey
    };

    const customer = {
        rfc: 'XAXX010101000',
        legalName: 'Generic Customer',
        postalCode: '67890',
        taxRegimen: '616'
    };

    // Execute
    // Note: generateSignedXml is private, testing via private access for unit verification logic
    const xml = await (service as any).generateSignedXml(invoice, tenantConfig, customer);

    // Verify XsltService called
    expect(mockXsltService.transform).toHaveBeenCalled();

    // Assertions
    expect(xml).toContain('Version="4.0"');
    expect(xml).toContain('FormaPago="03"');

    // Extract Sello
    const match = xml.match(/Sello="([^"]+)"/);
    expect(match).toBeTruthy();
    const sello = match ? match[1] : '';

    // Verify Signature
    const verify = crypto.createVerify('SHA256');
    verify.update(mockChain);
    verify.end();
    const isValid = verify.verify(publicKey, sello, 'base64');

    expect(isValid).toBe(true);
  });
});
