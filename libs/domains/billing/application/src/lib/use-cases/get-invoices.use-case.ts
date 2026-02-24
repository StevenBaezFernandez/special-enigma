import { Injectable, Inject } from '@nestjs/common';
import { Invoice, InvoiceRepository, INVOICE_REPOSITORY } from '@virteex/domain-billing-domain';

@Injectable()
export class GetInvoicesUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepository: InvoiceRepository
  ) {}

  async execute(): Promise<Invoice[]> {
    return this.invoiceRepository.findAll();
  }
}
