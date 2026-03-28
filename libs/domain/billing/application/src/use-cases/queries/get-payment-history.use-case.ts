import { Injectable, Inject } from '@nestjs/common';
import { type InvoiceRepository, INVOICE_REPOSITORY } from '@virteex/domain-billing-domain';

export interface PaymentHistoryItemDto {
  id: string;
  amount: number;
  date: string;
  description: string;
  status: string;
}

@Injectable()
export class GetPaymentHistoryUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY)
    private readonly repository: InvoiceRepository
  ) {}

  async execute(tenantId: string): Promise<PaymentHistoryItemDto[]> {
    const invoices = await this.repository.findByTenantId(tenantId);
    return invoices.map(inv => ({
      id: inv.id,
      amount: parseFloat(inv.totalAmount),
      date: inv.issueDate.toISOString(),
      description: inv.description || `Invoice #${inv.id}`,
      status: inv.status
    }));
  }
}
