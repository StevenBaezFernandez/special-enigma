import { Test, TestingModule } from '@nestjs/testing';
import { CreateInvoiceUseCase } from './create-invoice.use-case';
import { INVOICE_REPOSITORY, PRODUCT_REPOSITORY, InvoiceRepository, ProductRepository, FiscalStampingService } from '@virteex/billing-domain';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('CreateInvoiceUseCase', () => {
  let useCase: CreateInvoiceUseCase;
  let invoiceRepository: InvoiceRepository;
  let productRepository: ProductRepository;
  let fiscalStampingService: FiscalStampingService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateInvoiceUseCase,
        {
          provide: INVOICE_REPOSITORY,
          useValue: {
            save: jest.fn(),
            countByTenantId: jest.fn(),
          }
        },
        {
          provide: PRODUCT_REPOSITORY,
          useValue: {
            findById: jest.fn(),
          }
        },
        {
          provide: FiscalStampingService,
          useValue: {
            stampInvoice: jest.fn(),
          }
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          }
        }
      ],
    }).compile();

    useCase = module.get<CreateInvoiceUseCase>(CreateInvoiceUseCase);
    invoiceRepository = module.get(INVOICE_REPOSITORY);
    productRepository = module.get(PRODUCT_REPOSITORY);
    fiscalStampingService = module.get(FiscalStampingService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create an invoice and validate product price', async () => {
    const dto = {
      tenantId: 'tenant-1',
      customerId: 'customer-1',
      items: [
        {
          description: 'Test Product',
          quantity: 1,
          unitPrice: 100,
          productId: 'prod-1'
        }
      ]
    };

    const mockProduct = {
      id: 'prod-1',
      name: 'Test Product',
      price: 150,
      taxGroup: 'general'
    };

    (productRepository.findById as jest.Mock).mockResolvedValue(mockProduct);

    const mockStamp = {
        uuid: 'uuid-123',
        xml: '<xml></xml>',
        fechaTimbrado: new Date().toISOString(),
        selloSAT: 'sat',
        selloCFD: 'cfd'
    };
    (fiscalStampingService.stampInvoice as jest.Mock).mockResolvedValue(mockStamp);

    const result = await useCase.execute(dto);

    expect(productRepository.findById).toHaveBeenCalledWith('prod-1');
    const item = result.items.getItems()[0];
    expect(item.unitPrice).toBe('150.00');
    expect(result.totalAmount).toBe('174.00'); // 150 + 24 (16%)
    expect(result.status).toBe('STAMPED');
  });

  it('should fail if product is not found', async () => {
     const dto = {
      tenantId: 'tenant-1',
      customerId: 'customer-1',
      items: [
        {
          description: 'Test Product',
          quantity: 1,
          unitPrice: 100,
          productId: 'prod-999'
        }
      ]
    };

    (productRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow('Product with ID prod-999 not found');
  });
});
