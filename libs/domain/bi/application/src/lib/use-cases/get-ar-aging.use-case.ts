import { Injectable, Inject } from '@nestjs/common';
import { type InvoicePort, INVOICE_PORT, type ArAging } from '@virteex/domain-bi-domain';

@Injectable()
export class GetArAgingUseCase {
  constructor(
    @Inject(INVOICE_PORT) private readonly invoicePort: InvoicePort
  ) {}

  async execute(tenantId: string): Promise<ArAging> {
    return this.invoicePort.getArAging(tenantId);
  }
}
