import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceConsumer } from './invoice.consumer';

describe('InvoiceConsumer', () => {
  let consumer: InvoiceConsumer;

  const mockFiscalProvider = {
    validateInvoice: vi.fn().mockResolvedValue(true),
    signInvoice: vi.fn().mockResolvedValue('mock-signature'),
    transmitInvoice: vi.fn().mockResolvedValue(undefined),
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
