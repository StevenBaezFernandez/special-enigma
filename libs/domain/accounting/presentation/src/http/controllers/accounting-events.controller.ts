import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ACCOUNTING_EVENT_CONSUMER_PORT } from '@virteex/domain-accounting-application';
import type { AccountingEventConsumerPort } from '@virteex/domain-accounting-application';
import {
  ACCOUNTING_EVENTS,
  ACCOUNTING_INTEGRATION_EVENTS,
} from '@virteex/domain-accounting-contracts';
import type {
  InvoiceValidatedEventDto,
  InvoiceStampedV1EventDto,
  PayrollStampedV1EventDto,
} from '@virteex/domain-accounting-contracts';

@Controller()
export class AccountingEventsController {
  constructor(
    @Inject(ACCOUNTING_EVENT_CONSUMER_PORT)
    private readonly consumerService: AccountingEventConsumerPort,
  ) {}

  @EventPattern(ACCOUNTING_INTEGRATION_EVENTS.INVOICE_STAMPED_V1)
  async handleInvoiceStampedV1(@Payload() event: InvoiceStampedV1EventDto) {
    return this.consumerService.consumeInvoiceStampedV1(event);
  }

  @EventPattern(ACCOUNTING_INTEGRATION_EVENTS.PAYROLL_STAMPED_V1)
  async handlePayrollStampedV1(@Payload() event: PayrollStampedV1EventDto) {
    return this.consumerService.consumePayrollStampedV1(event);
  }

  @EventPattern(ACCOUNTING_EVENTS.BILLING_INVOICE_VALIDATED)
  async handleInvoiceValidated(@Payload() event: InvoiceValidatedEventDto) {
    return this.consumerService.consumeInvoiceValidated(event);
  }
}
