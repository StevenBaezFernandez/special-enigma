import { Injectable, Inject } from '@nestjs/common';
import { Invoice, type InvoiceRepository, INVOICE_REPOSITORY } from '@virteex/domain-billing-domain';

@Injectable()
export class GetInvoicesUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepository: InvoiceRepository
  ) {}

  async execute(tenantId: string): Promise<Invoice[]> {
    return this.invoiceRepository.findByTenantId(tenantId);
  }
}
