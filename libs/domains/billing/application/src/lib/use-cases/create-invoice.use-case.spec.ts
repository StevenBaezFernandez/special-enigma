import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from 'decimal.js';
import {
  FiscalStampingService,
  INVOICE_REPOSITORY,
  InvoiceRepository,
  PRODUCT_REPOSITORY,
  ProductRepository,
  TaxCalculatorService,
  TENANT_CONFIG_REPOSITORY,
  TenantConfigRepository,
} from '@virteex/domain-billing-domain';
import { CreateInvoiceUseCase } from './create-invoice.use-case';
import { INVOICE_INTEGRATION_PUBLISHER, InvoiceIntegrationPublisherPort } from '../ports/invoice-integration-publisher.port';
import { PriceValidationPolicy } from '../services/price-validation.policy';
import { InvoiceStampingOrchestrator } from '../services/invoice-stamping.orchestrator';

describe('CreateInvoiceUseCase', () => {
  let useCase: CreateInvoiceUseCase;
  let invoiceRepository: InvoiceRepository;
  let integrationPublisher: InvoiceIntegrationPublisherPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateInvoiceUseCase,
        PriceValidationPolicy,
        InvoiceStampingOrchestrator,
        {
          provide: INVOICE_REPOSITORY,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: PRODUCT_REPOSITORY,
          useValue: {
            findById: jest.fn().mockResolvedValue({ id: 'p1', price: 100 }),
          } satisfies ProductRepository,
        },
        {
          provide: TENANT_CONFIG_REPOSITORY,
          useValue: {
            getFiscalConfig: jest.fn().mockResolvedValue({ country: 'MX' }),
          } satisfies Partial<TenantConfigRepository>,
        },
        {
          provide: TaxCalculatorService,
          useValue: {
            calculateTax: jest.fn().mockImplementation((amount: number) => ({ totalTax: new Decimal(amount).times(0.16).toNumber() })),
          },
        },
        {
          provide: FiscalStampingService,
          useValue: {
            stampInvoice: jest.fn().mockResolvedValue({ uuid: 'uuid-1', xml: '<xml />', fechaTimbrado: new Date().toISOString() }),
          },
        },
        {
          provide: INVOICE_INTEGRATION_PUBLISHER,
          useValue: {
            publishInvoiceStamped: jest.fn(),
          } satisfies InvoiceIntegrationPublisherPort,
        },
      ],
    }).compile();

    useCase = module.get(CreateInvoiceUseCase);
    invoiceRepository = module.get(INVOICE_REPOSITORY);
    integrationPublisher = module.get(INVOICE_INTEGRATION_PUBLISHER);
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
