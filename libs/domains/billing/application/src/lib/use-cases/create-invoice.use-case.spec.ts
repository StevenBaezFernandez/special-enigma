import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { CreateInvoiceUseCase } from './create-invoice.use-case';
import {
  INVOICE_REPOSITORY,
  PRODUCT_REPOSITORY,
  TENANT_CONFIG_REPOSITORY,
  InvoiceRepository,
  ProductRepository,
  FiscalStampingService,
  TaxCalculatorService,
  TenantConfigRepository,
  Invoice,
  InvoiceItem
} from '@virteex/domain-billing-domain';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainException } from '@virteex/shared-util-server-config';

describe('CreateInvoiceUseCase', () => {
  let useCase: CreateInvoiceUseCase;
  let invoiceRepository: InvoiceRepository;
  let productRepository: ProductRepository;
  let fiscalStampingService: FiscalStampingService;
  let taxCalculatorService: TaxCalculatorService;
  let tenantConfigRepository: TenantConfigRepository;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot({
          driver: SqliteDriver,
          dbName: ':memory:',
          entities: [Invoice, InvoiceItem],
          allowGlobalContext: true,
        }),
        MikroOrmModule.forFeature([Invoice, InvoiceItem])
      ],
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
          provide: TENANT_CONFIG_REPOSITORY,
          useValue: {
            getFiscalConfig: jest.fn(),
          }
        },
        {
          provide: FiscalStampingService,
          useValue: {
            stampInvoice: jest.fn(),
          }
        },
        {
          provide: TaxCalculatorService,
          useValue: {
            calculateTax: jest.fn(),
          }
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          }
        },
        {
          provide: 'KAFKA_SERVICE',
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
    taxCalculatorService = module.get(TaxCalculatorService);
    tenantConfigRepository = module.get(TENANT_CONFIG_REPOSITORY);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create an invoice and validate product price', async () => {
    const dto = {
      tenantId: 'tenant-1',
      customerId: 'customer-1',
      dueDate: '2024-05-30',
      paymentForm: '01',
      paymentMethod: 'PUE',
      usage: 'G01',
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
    (tenantConfigRepository.getFiscalConfig as jest.Mock).mockResolvedValue({ country: 'MX' });
    (taxCalculatorService.calculateTax as jest.Mock).mockResolvedValue({ totalTax: 24, details: [] }); // 150 * 0.16 = 24

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
    expect(item.unitPrice).toBe('150.00'); // Price updated from catalog
    expect(result.totalAmount).toBe('174.00'); // 150 + 24
    expect(result.status).toBe('STAMPED');
  });

  it('should fail if product is not found', async () => {
     const dto = {
      tenantId: 'tenant-1',
      customerId: 'customer-1',
      dueDate: '2024-05-30',
      paymentForm: '01',
      paymentMethod: 'PUE',
      usage: 'G01',
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
    (tenantConfigRepository.getFiscalConfig as jest.Mock).mockResolvedValue({ country: 'MX' });

    await expect(useCase.execute(dto)).rejects.toThrow(DomainException);
  });
});
