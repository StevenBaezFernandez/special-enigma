import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Invoice, InvoiceRepository, INVOICE_REPOSITORY, FiscalStampingService, InvoiceStampedEvent } from '@virteex/billing-domain';

export class CreateInvoiceDto {
  tenantId!: string;
  customerId!: string;
  totalAmount!: string;
  taxAmount!: string;
}

@Injectable()
export class CreateInvoiceUseCase {
  private readonly logger = new Logger(CreateInvoiceUseCase.name);

  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepository: InvoiceRepository,
    private readonly fiscalStampingService: FiscalStampingService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(dto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = new Invoice(dto.tenantId, dto.customerId, dto.totalAmount, dto.taxAmount);

    try {
      this.logger.log(`Stamping invoice for customer ${dto.customerId}`);
      const stamp = await this.fiscalStampingService.stampInvoice(invoice);

      invoice.fiscalUuid = stamp.uuid;
      invoice.xmlContent = stamp.xml;
      invoice.stampedAt = new Date(stamp.fechaTimbrado);
      invoice.status = 'STAMPED';

      this.logger.log(`Invoice stamped. UUID: ${stamp.uuid}`);

      this.eventEmitter.emit(
        'invoice.stamped',
        new InvoiceStampedEvent(
            invoice.id,
            invoice.tenantId,
            Number(invoice.totalAmount),
            Number(invoice.taxAmount),
            new Date()
        )
      );

    } catch (error) {
      this.logger.error(`Failed to stamp invoice: ${error}`);
      throw error;
    }

    await this.invoiceRepository.save(invoice);
    return invoice;
  }
}
