import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FiscalStampingService } from './fiscal-stamping.service';
import { Invoice } from '../entities/invoice.entity';

describe('FiscalStampingService', () => {
  let service: FiscalStampingService;

  const mockPacFactory = { getProvider: vi.fn() };
  const mockTenantConfigRepo = { getFiscalConfig: vi.fn() };
  const mockCustomerRepo = { findById: vi.fn() };
  const mockBuilderFactory = { getBuilder: vi.fn() };
  const mockBuilder = { build: vi.fn() };
  const mockProvider = { stamp: vi.fn(), cancel: vi.fn() };

  beforeEach(async () => {
    service = new FiscalStampingService(
        mockPacFactory as any,
        mockTenantConfigRepo as any,
        mockCustomerRepo as any,
        mockBuilderFactory as any
    );

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
      expect(mockBuilder.build).toHaveBeenCalledWith({ invoice, tenantConfig, customer });
      expect(mockPacFactory.getProvider).toHaveBeenCalledWith('MX');
      expect(mockProvider.stamp).toHaveBeenCalledWith(document);
      expect(result).toBe(stamp);
  });
});
