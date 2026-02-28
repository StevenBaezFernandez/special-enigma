import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientKafka } from '@nestjs/microservices';
import { Invoice, InvoiceStampedEvent } from '@virteex/domain-billing-domain';
import { InvoiceIntegrationPublisherPort } from '@virteex/application-billing-application';

@Injectable()
export class InvoiceIntegrationPublisher implements InvoiceIntegrationPublisherPort {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async publishInvoiceStamped(invoice: Invoice): Promise<void> {
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

    this.kafkaClient.emit('billing.invoice.validated', {
      id: invoice.id,
      tenantId: invoice.tenantId,
      totalAmount: invoice.totalAmount,
      taxAmount: invoice.taxAmount,
      stampedAt: invoice.stampedAt,
    });
  }
}
