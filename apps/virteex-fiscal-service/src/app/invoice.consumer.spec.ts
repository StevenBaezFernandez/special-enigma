import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceConsumer } from './invoice.consumer';

describe('InvoiceConsumer', () => {
  let consumer: InvoiceConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceConsumer],
    }).compile();

    consumer = module.get<InvoiceConsumer>(InvoiceConsumer);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });
});
