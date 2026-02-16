import { Test, TestingModule } from '@nestjs/testing';
import { FiscalStampingService } from './fiscal-stamping.service';
import { PAC_STRATEGY_FACTORY } from '../ports/pac-strategy.factory';
import { TENANT_CONFIG_REPOSITORY } from '../ports/tenant-config.port';
import { CUSTOMER_REPOSITORY } from '../ports/customer.repository';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import * as crypto from 'crypto';

describe('FiscalStampingService', () => {
  let service: FiscalStampingService;

  // Mock Dependencies
  const mockPacFactory = { getProvider: jest.fn() };
  const mockTenantRepo = { getFiscalConfig: jest.fn() };
  const mockCustomerRepo = { findById: jest.fn() };

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
      ],
    }).compile();

    service = module.get<FiscalStampingService>(FiscalStampingService);
  });

  it('should generate valid signed XML', () => {
    // Setup Data
    const invoice = new Invoice('tenant1', 'cust1', '0', '0');
    invoice.id = '12345678-uuid'; // Use a fixed prefix for substr(0,8) match
    invoice.paymentForm = '03';
    invoice.paymentMethod = 'PUE';
    invoice.usage = 'G03';
    invoice.totalAmount = '116.00';
    invoice.taxAmount = '16.00';

    const item = new InvoiceItem(invoice, 'Product 1', 1, '100.00', '100.00', '16.00');
    invoice.items.add(item);

    const tenantConfig = {
        rfc: 'AAA010101AAA',
        country: 'MX',
        legalName: 'Test Company',
        regime: '601',
        postalCode: '12345',
        certificateNumber: '00001000000500000000',
        csdCertificate: 'BASE64CERT',
        csdKey: privateKey // Use the real private key for signing test
    };

    const customer = {
        rfc: 'XAXX010101000',
        legalName: 'Generic Customer',
        postalCode: '67890',
        taxRegimen: '616'
    };

    // Execute (private method access)
    const xml = (service as any).generateXml(invoice, tenantConfig, customer);

    // Assertions
    expect(xml).toContain('Version="4.0"');
    expect(xml).toContain('FormaPago="03"');
    expect(xml).toContain('MetodoPago="PUE"');
    expect(xml).toContain('UsoCFDI="G03"');
    expect(xml).toContain(`NoCertificado="${tenantConfig.certificateNumber}"`);

    // Extract Sello
    const match = xml.match(/Sello="([^"]+)"/);
    expect(match).toBeTruthy();
    const sello = match ? match[1] : '';

    // Verify Signature
    const verify = crypto.createVerify('SHA256');

    const fechaMatch = xml.match(/Fecha="([^"]+)"/);
    const fecha = fechaMatch ? fechaMatch[1] : '';

    // Reconstruct the exact chain used in service
    const expectedChain = `||4.0|A|12345678|${fecha}|03|${tenantConfig.certificateNumber}|100.00|MXN|116.00|I|01|PUE|12345||`;

    verify.update(expectedChain);
    verify.end();
    const isValid = verify.verify(publicKey, sello, 'base64');

    expect(isValid).toBe(true);
  });
});
