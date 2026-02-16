import { Injectable, Inject } from '@nestjs/common';
import { InvoicePort, INVOICE_PORT, ArAging } from '@virteex/bi-domain';

@Injectable()
export class GetArAgingUseCase {
  constructor(
    @Inject(INVOICE_PORT) private readonly invoicePort: InvoicePort
  ) {}

  async execute(tenantId: string): Promise<ArAging> {
    return this.invoicePort.getArAging(tenantId);
  }
}
