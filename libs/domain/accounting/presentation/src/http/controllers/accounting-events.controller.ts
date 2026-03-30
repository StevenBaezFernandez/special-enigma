import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AccountingEventConsumerService, InvoiceValidatedEvent } from '@virteex/domain-accounting-infrastructure';

@Controller()
export class AccountingEventsController {
  constructor(
    private readonly consumerService: AccountingEventConsumerService
  ) {}

  @EventPattern('billing.invoice.validated')
  async handleInvoiceValidated(@Payload() event: InvoiceValidatedEvent) {
    return this.consumerService.consumeInvoiceValidated(event);
  }
}
