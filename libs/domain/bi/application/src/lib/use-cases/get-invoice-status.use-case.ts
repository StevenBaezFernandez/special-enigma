import { Injectable, Inject } from '@nestjs/common';
import { type InvoicePort, INVOICE_PORT, type InvoiceStatusSummary } from '@virteex/domain-bi-domain';

@Injectable()
export class GetInvoiceStatusUseCase {
  constructor(
    @Inject(INVOICE_PORT) private readonly invoicePort: InvoicePort
  ) {}

  async execute(tenantId: string): Promise<InvoiceStatusSummary> {
    return this.invoicePort.getStatusSummary(tenantId);
  }
}
