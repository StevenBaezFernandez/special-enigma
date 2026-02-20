import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceConsumer } from './invoice.consumer';

describe('InvoiceConsumer', () => {
  let consumer: InvoiceConsumer;

  const mockFiscalProvider = {
    validateInvoice: jest.fn().mockResolvedValue(true),
    signInvoice: jest.fn().mockResolvedValue('mock-signature'),
    transmitInvoice: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceConsumer],
      providers: [
        {
          provide: 'FiscalProvider',
          useValue: mockFiscalProvider,
        },
      ],
    }).compile();

    consumer = module.get<InvoiceConsumer>(InvoiceConsumer);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });
});
