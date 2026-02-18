import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class InvoiceConsumer {
  @MessagePattern('billing.invoice.created')
  handleInvoiceCreated(@Payload() data: any) {
    console.log('Received invoice created event:', data);
    // Logic to call PAC would go here
  }
}
