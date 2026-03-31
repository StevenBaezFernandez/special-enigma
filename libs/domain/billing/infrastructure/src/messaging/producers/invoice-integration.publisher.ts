import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientKafka } from '@nestjs/microservices';
import { Invoice, InvoiceStampedEvent } from '@virteex/domain-billing-domain';
import { type InvoiceIntegrationPublisherPort } from '@virteex/domain-billing-application';
import { ACCOUNTING_INTEGRATION_EVENTS, InvoiceStampedV1EventDto } from '@virteex/domain-accounting-contracts';

@Injectable()
export class InvoiceIntegrationPublisher implements InvoiceIntegrationPublisherPort {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async publishInvoiceStamped(invoice: Invoice): Promise<void> {
    const payload: InvoiceStampedV1EventDto = {
      invoiceId: invoice.id,
      tenantId: invoice.tenantId,
      totalAmount: Number(invoice.totalAmount),
      taxAmount: Number(invoice.taxAmount),
      stampedAt: invoice.stampedAt?.toISOString() || new Date().toISOString(),
    };

    // 1. Emit internal event for this domain (using domain event class)
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

    // 2. Emit versioned integration event for other domains (e.g., Accounting)
    this.eventEmitter.emit(
      ACCOUNTING_INTEGRATION_EVENTS.INVOICE_STAMPED_V1,
      payload
    );

    // 3. Publish to Kafka for distributed consumers
    this.kafkaClient.emit(ACCOUNTING_INTEGRATION_EVENTS.INVOICE_STAMPED_V1, payload);

    // Maintain legacy emission for backward compatibility during transition if needed
    this.kafkaClient.emit('billing.invoice.validated', {
      id: invoice.id,
      tenantId: invoice.tenantId,
      totalAmount: invoice.totalAmount,
      taxAmount: invoice.taxAmount,
      stampedAt: invoice.stampedAt,
    });
  }
}
