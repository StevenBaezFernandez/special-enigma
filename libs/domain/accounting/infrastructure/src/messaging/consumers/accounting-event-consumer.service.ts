import { Injectable, Logger } from '@nestjs/common';
import { AccountingEventHandlerService } from '@virteex/domain-accounting-application';
import { InvoiceValidatedEventDto } from '@virteex/domain-accounting-contracts';

@Injectable()
export class AccountingEventConsumerService {
  private readonly logger = new Logger(AccountingEventConsumerService.name);

  constructor(
    private readonly eventHandlerService: AccountingEventHandlerService
  ) {}

  async consumeInvoiceValidated(event: InvoiceValidatedEventDto) {
    const correlationId = event.invoiceId;
    this.logger.log({
      message: `Processing accounting for Invoice ${event.invoiceId}`,
      correlationId,
      tenantId: event.tenantId,
      eventType: 'billing.invoice.validated'
    });

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const totalTax = event.lines.reduce((sum, line) => sum + line.taxAmount, 0);
        await this.eventHandlerService.handleInvoiceStamped({
          invoiceId: event.invoiceId,
          tenantId: event.tenantId,
          total: event.totalAmount,
          taxes: totalTax,
          date: new Date(event.date)
        });

        this.logger.log({
          message: `Journal Entry created successfully for Invoice ${event.invoiceId}`,
          correlationId,
          attempt: attempt + 1
        });
        return;
      } catch (e) {
        attempt++;
        const error = e as Error;
        this.logger.warn({
          message: `Failed attempt ${attempt} to process Invoice ${event.invoiceId}`,
          correlationId,
          error: error.message
        });

        if (attempt >= maxRetries) {
          this.logger.error({
            message: `Permanent failure processing Invoice ${event.invoiceId} after ${maxRetries} attempts. Moving to DLQ preparation.`,
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
