import { Injectable, Logger, Optional } from '@nestjs/common';
import { AccountingEventHandlerService } from '@virteex/domain-accounting-application';
import type { AccountingEventConsumerPort } from '@virteex/domain-accounting-application';
import {
  InvoiceStampedV1EventDto,
  InvoiceValidatedEventDto,
  PayrollStampedV1EventDto,
} from '@virteex/domain-accounting-contracts';

@Injectable()
export class AccountingEventConsumerService
  implements AccountingEventConsumerPort
{
  private readonly logger = new Logger(AccountingEventConsumerService.name);

  constructor(
    @Optional()
    private readonly eventHandlerService?: AccountingEventHandlerService,
  ) {}

  /**
   * Anti-Corruption Layer (ACL) Mapper for V1 Integration Event
   */
  async consumeInvoiceStampedV1(event: InvoiceStampedV1EventDto) {
    if (!this.eventHandlerService) {
      this.logger.error(
        'AccountingEventHandlerService is not available; skipping InvoiceStampedV1 event processing.',
      );
      return;
    }
    this.logger.log(
      `Processing V1 Invoice Stamped integration event: ${event.invoiceId}`,
    );

    await this.eventHandlerService.handleInvoiceStamped({
      invoiceId: event.invoiceId,
      tenantId: event.tenantId,
      total: event.totalAmount,
      taxes: event.taxAmount,
      date: new Date(event.stampedAt),
    });
  }

  async consumePayrollStampedV1(event: PayrollStampedV1EventDto) {
    if (!this.eventHandlerService) {
      this.logger.error(
        'AccountingEventHandlerService is not available; skipping PayrollStampedV1 event processing.',
      );
      return;
    }
    this.logger.log(
      `Processing V1 Payroll Stamped integration event: ${event.payrollId}`,
    );

    await this.eventHandlerService.handlePayrollStamped({
      payrollId: event.payrollId,
      tenantId: event.tenantId,
      netPay: event.netAmount,
      taxes: event.taxAmount,
      date: new Date(event.stampedAt),
    });
  }

  /**
   * @deprecated Handle legacy event format
   */
  async consumeInvoiceValidated(event: InvoiceValidatedEventDto) {
    if (!this.eventHandlerService) {
      this.logger.error(
        'AccountingEventHandlerService is not available; skipping legacy InvoiceValidated event processing.',
      );
      return;
    }
    const correlationId = event.invoiceId;
    this.logger.log({
      message: `Processing legacy accounting for Invoice ${event.invoiceId}`,
      correlationId,
      tenantId: event.tenantId,
      eventType: 'billing.invoice.validated',
    });

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const totalTax = event.lines
          ? event.lines.reduce((sum, line) => sum + line.taxAmount, 0)
          : 0;
        await this.eventHandlerService.handleInvoiceStamped({
          invoiceId: event.invoiceId,
          tenantId: event.tenantId,
          total: event.totalAmount,
          taxes: totalTax,
          date: new Date(event.date),
        });

        this.logger.log({
          message: `Journal Entry created successfully for Invoice ${event.invoiceId}`,
          correlationId,
          attempt: attempt + 1,
        });
        return;
      } catch (e) {
        attempt++;
        const error = e as Error;
        this.logger.warn({
          message: `Failed attempt ${attempt} to process Invoice ${event.invoiceId}`,
          correlationId,
          error: error.message,
        });

        if (attempt >= maxRetries) {
          this.logger.error({
            message: `Permanent failure processing Invoice ${event.invoiceId} after ${maxRetries} attempts. Moving to DLQ preparation.`,
            correlationId,
            error: error.message,
            stack: error.stack,
            eventPayload: event,
          });
          throw e; // Rethrow for broker retry
        }

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000),
        );
      }
    }
  }
}
