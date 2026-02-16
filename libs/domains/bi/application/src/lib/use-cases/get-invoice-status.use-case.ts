import { Injectable, Inject } from '@nestjs/common';
import { InvoicePort, INVOICE_PORT, InvoiceStatusSummary } from '@virteex/bi-domain';

@Injectable()
export class GetInvoiceStatusUseCase {
  constructor(
    @Inject(INVOICE_PORT) private readonly invoicePort: InvoicePort
  ) {}

  async execute(tenantId: string): Promise<InvoiceStatusSummary> {
    return this.invoicePort.getStatusSummary(tenantId);
  }
}
