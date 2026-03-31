import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CreateInvoiceUseCase } from './create-invoice.use-case';

describe('CreateInvoiceUseCase', () => {
  let useCase: CreateInvoiceUseCase;
  let entitlementService: any;
  let invoiceRepository: any;

  beforeEach(() => {
    invoiceRepository = {
      countByTenantId: vi.fn().mockResolvedValue(5),
      save: vi.fn(),
    };
    entitlementService = {
      checkQuota: vi.fn(),
    };

    useCase = new CreateInvoiceUseCase(
      invoiceRepository,
      {} as any,
      { getFiscalConfig: vi.fn().mockResolvedValue({}) } as any,
      { calculateTax: vi.fn().mockResolvedValue({ totalTax: 0 }) } as any,
      { resolvePrice: vi.fn().mockResolvedValue(10) } as any,
      { stamp: vi.fn() } as any,
      {} as any,
      { publishInvoiceStamped: vi.fn() } as any,
      entitlementService
    );
  });

  it('should call checkQuota before creating invoice', async () => {
    const dto = {
      tenantId: 't1',
      customerId: 'c1',
      dueDate: new Date().toISOString(),
      items: [],
      paymentForm: '01',
      paymentMethod: 'PPD',
      usage: 'G03'
    };

    await useCase.execute(dto as any);

    expect(invoiceRepository.countByTenantId).toHaveBeenCalledWith('t1');
    expect(entitlementService.checkQuota).toHaveBeenCalledWith('invoices', 5);
  });
});
