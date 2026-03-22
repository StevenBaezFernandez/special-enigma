import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Decimal } from 'decimal.js';
import { FiscalStampingService, INVOICE_REPOSITORY, type InvoiceRepository, PRODUCT_REPOSITORY, type ProductRepository, TaxCalculatorService, TENANT_CONFIG_REPOSITORY, type TenantConfigRepository } from '@virteex/domain-billing-domain';
import { CreateInvoiceUseCase } from './create-invoice.use-case';
import { INVOICE_INTEGRATION_PUBLISHER, type InvoiceIntegrationPublisherPort } from '../ports/invoice-integration-publisher.port';
import { PriceValidationPolicy } from '../services/price-validation.policy';
import { InvoiceStampingOrchestrator } from '../services/invoice-stamping.orchestrator';
import { SUBSCRIPTION_REPOSITORY } from '@virteex/domain-subscription-domain';

describe('CreateInvoiceUseCase', () => {
  let useCase: CreateInvoiceUseCase;
  let invoiceRepository: any;
  let integrationPublisher: any;

  const mockInvoiceRepository = {
    save: vi.fn(),
    countByTenantId: vi.fn(),
    findByTenantAndDateRange: vi.fn(),
  };
  const mockProductRepository = {
    findById: vi.fn(),
  };
  const mockTenantConfigRepository = {
    getFiscalConfig: vi.fn(),
  };
  const mockSubscriptionRepository = {
    findByTenantId: vi.fn(),
  };
  const mockTaxCalculatorService = {
    calculateTax: vi.fn(),
  };
  const mockFiscalStampingService = {
    stampInvoice: vi.fn(),
  };
  const mockIntegrationPublisher = {
    publishInvoiceStamped: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    const priceValidationPolicy = new PriceValidationPolicy();
    const stampingOrchestrator = new InvoiceStampingOrchestrator(mockFiscalStampingService as any);

    useCase = new CreateInvoiceUseCase(
      mockInvoiceRepository as any,
      mockProductRepository as any,
      mockTenantConfigRepository as any,
      mockTaxCalculatorService as any,
      priceValidationPolicy,
      stampingOrchestrator,
      mockSubscriptionRepository as any,
      mockIntegrationPublisher as any
    );

    invoiceRepository = mockInvoiceRepository;
    integrationPublisher = mockIntegrationPublisher;

    // Default mocks
    mockInvoiceRepository.countByTenantId.mockResolvedValue(0);
    mockProductRepository.findById.mockResolvedValue({ id: 'p1', price: 100 });
    mockTenantConfigRepository.getFiscalConfig.mockResolvedValue({ country: 'MX' });
    mockSubscriptionRepository.findByTenantId.mockResolvedValue({ plan: { limits: { invoices: 2 } } });
    mockTaxCalculatorService.calculateTax.mockImplementation((amount: number) => ({ totalTax: new Decimal(amount).times(0.16).toNumber() }));
    mockFiscalStampingService.stampInvoice.mockResolvedValue({ uuid: 'uuid-1', xml: '<xml />', fechaTimbrado: new Date().toISOString() });
  });

  it('should fail when invoice plan limit is reached', async () => {
    mockInvoiceRepository.countByTenantId.mockResolvedValue(2);

    await expect(
      useCase.execute({
        tenantId: 'tenant-1',
        customerId: 'customer-1',
        dueDate: '2026-01-01',
        paymentForm: '01',
        paymentMethod: 'PUE',
        usage: 'G03',
        items: [{ description: 'Item A', quantity: 1, unitPrice: 120, productId: 'p1' }],
      })
    ).rejects.toThrow(/Invoice limit reached/);
  });

  it('should create, stamp and publish invoice without infrastructure coupling', async () => {
    const result = await useCase.execute({
      tenantId: 'tenant-1',
      customerId: 'customer-1',
      dueDate: '2026-01-01',
      paymentForm: '01',
      paymentMethod: 'PUE',
      usage: 'G03',
      items: [{ description: 'Item A', quantity: 1, unitPrice: 120, productId: 'p1' }],
    });

    expect(result.status).toBe('STAMPED');
    expect(invoiceRepository.save).toHaveBeenCalledTimes(2);
    expect(integrationPublisher.publishInvoiceStamped).toHaveBeenCalledTimes(1);
  });
});
