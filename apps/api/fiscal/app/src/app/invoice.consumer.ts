import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FiscalProvider } from '@virteex/domain-fiscal-domain';

@Controller()
export class InvoiceConsumer {
  private readonly logger = new Logger(InvoiceConsumer.name);

  constructor(
    @Inject('FiscalProvider') private readonly fiscalProvider: FiscalProvider
  ) {}

  @MessagePattern('billing.invoice.created')
  async handleInvoiceCreated(@Payload() data: any) {
    this.logger.log(`Received invoice created event: ${JSON.stringify(data)}`);

    try {
      this.logger.log('Starting fiscal validation process...');
      const isValid = await this.fiscalProvider.validateInvoice(data);

      if (isValid) {
        const signature = await this.fiscalProvider.signInvoice(data);
        this.logger.log(`Invoice signed successfully: ${signature}`);

        await this.fiscalProvider.transmitInvoice(data);
        this.logger.log('Invoice transmitted successfully to Tax Authority.');
      } else {
        this.logger.warn('Invoice validation failed.');
      }
    } catch (error: any) {
      this.logger.error(`Error processing invoice fiscal data: ${error.message}`, error.stack);
    }
  }
}
