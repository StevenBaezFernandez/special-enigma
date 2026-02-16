import { Test, TestingModule } from '@nestjs/testing';
import { FiscalStampingService } from './fiscal-stamping.service';
import { PAC_STRATEGY_FACTORY } from '../ports/pac-strategy.factory';
import { TENANT_CONFIG_REPOSITORY } from '../ports/tenant-config.port';
import { CUSTOMER_REPOSITORY } from '../ports/customer.repository';
import { FISCAL_DOCUMENT_BUILDER_FACTORY } from '../ports/fiscal-document-builder.port';
import { Invoice } from '../entities/invoice.entity';

describe('FiscalStampingService', () => {
  let service: FiscalStampingService;

  const mockPacFactory = { getProvider: jest.fn() };
  const mockTenantConfigRepo = { getFiscalConfig: jest.fn() };
  const mockCustomerRepo = { findById: jest.fn() };
  const mockBuilderFactory = { getBuilder: jest.fn() };
  const mockBuilder = { build: jest.fn() };
  const mockProvider = { stamp: jest.fn(), cancel: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiscalStampingService,
        { provide: PAC_STRATEGY_FACTORY, useValue: mockPacFactory },
        { provide: TENANT_CONFIG_REPOSITORY, useValue: mockTenantConfigRepo },
        { provide: CUSTOMER_REPOSITORY, useValue: mockCustomerRepo },
        { provide: FISCAL_DOCUMENT_BUILDER_FACTORY, useValue: mockBuilderFactory },
      ],
    }).compile();

    service = module.get<FiscalStampingService>(FiscalStampingService);

    mockPacFactory.getProvider.mockReturnValue(mockProvider);
    mockBuilderFactory.getBuilder.mockReturnValue(mockBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should stamp invoice', async () => {
      const invoice = new Invoice('tenant-1', 'cust-1', '116.00', '16.00');
      const tenantConfig = { country: 'MX', rfc: 'AAA010101AAA', postalCode: '12345', regime: '601' };
      const customer = { id: 'cust-1', rfc: 'XAXX010101000', postalCode: '12345', taxRegimen: '616' };
      const document = '<xml>signed</xml>';
      const stamp = { uuid: 'uuid-123', xml: document };

      mockTenantConfigRepo.getFiscalConfig.mockResolvedValue(tenantConfig);
      mockCustomerRepo.findById.mockResolvedValue(customer);
      mockBuilder.build.mockResolvedValue(document);
      mockProvider.stamp.mockResolvedValue(stamp);

      const result = await service.stampInvoice(invoice);

      expect(mockTenantConfigRepo.getFiscalConfig).toHaveBeenCalledWith(invoice.tenantId);
      expect(mockCustomerRepo.findById).toHaveBeenCalledWith(invoice.customerId);
      expect(mockBuilderFactory.getBuilder).toHaveBeenCalledWith('MX');
      expect(mockBuilder.build).toHaveBeenCalledWith(invoice, tenantConfig, customer);
      expect(mockPacFactory.getProvider).toHaveBeenCalledWith('MX');
      expect(mockProvider.stamp).toHaveBeenCalledWith(document);
      expect(result).toBe(stamp);
  });
});
