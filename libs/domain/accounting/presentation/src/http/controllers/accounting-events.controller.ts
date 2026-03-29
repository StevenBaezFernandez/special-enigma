import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AccountingEventHandlerService } from '@virteex/domain-accounting-application';

interface InvoiceValidatedEvent {
    id: string;
    tenantId: string;
    totalAmount: string;
    taxAmount: string;
    stampedAt: string | Date;
}

@Controller()
export class AccountingEventsController {
  private readonly logger = new Logger(AccountingEventsController.name);

  constructor(
    private readonly eventHandlerService: AccountingEventHandlerService
  ) {}

  @EventPattern('billing.invoice.validated')
  async handleInvoiceValidated(@Payload() event: InvoiceValidatedEvent) {
    const correlationId = `inv-${event.id}-${Date.now()}`;
    this.logger.log({
      message: `Processing accounting for Invoice ${event.id}`,
      correlationId,
      tenantId: event.tenantId,
      eventType: 'billing.invoice.validated'
    });

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        await this.eventHandlerService.handleInvoiceStamped({
          invoiceId: event.id,
          tenantId: event.tenantId,
          total: Number(event.totalAmount),
          taxes: Number(event.taxAmount),
          date: new Date(event.stampedAt)
        });

        this.logger.log({
          message: `Journal Entry created successfully for Invoice ${event.id}`,
          correlationId,
          attempt: attempt + 1
        });
        return;
      } catch (e) {
        attempt++;
        const error = e as Error;
        this.logger.warn({
          message: `Failed attempt ${attempt} to process Invoice ${event.id}`,
          correlationId,
          error: error.message
        });

        if (attempt >= maxRetries) {
          this.logger.error({
            message: `Permanent failure processing Invoice ${event.id} after ${maxRetries} attempts. Moving to DLQ preparation.`,
            correlationId,
            error: error.message,
            stack: error.stack,
            eventPayload: event
          });
          throw e; // Rethrow for broker retry
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
}
