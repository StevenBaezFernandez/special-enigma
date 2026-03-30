import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AccountingEventConsumerService } from '@virteex/domain-accounting-infrastructure';
import { InvoiceValidatedEventDto, ACCOUNTING_EVENTS } from '@virteex/domain-accounting-contracts';

@Controller()
export class AccountingEventsController {
  constructor(
    private readonly consumerService: AccountingEventConsumerService
  ) {}

  @EventPattern(ACCOUNTING_EVENTS.BILLING_INVOICE_VALIDATED)
  async handleInvoiceValidated(@Payload() event: InvoiceValidatedEventDto) {
    return this.consumerService.consumeInvoiceValidated(event);
  }
}
