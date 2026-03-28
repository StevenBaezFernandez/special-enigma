import { Injectable, Inject, Logger } from '@nestjs/common';
import { INVOICE_REPOSITORY, type InvoiceRepository, TENANT_CONFIG_REPOSITORY, type TenantConfigRepository } from '@virteex/domain-billing-domain';

@Injectable()
export class ReconcileBillingUseCase {
  private readonly logger = new Logger(ReconcileBillingUseCase.name);

  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepository: InvoiceRepository,
    @Inject(TENANT_CONFIG_REPOSITORY) private readonly tenantConfigRepository: TenantConfigRepository,
  ) {}

  async execute(tenantId: string, startDate: Date, endDate: Date): Promise<{ matched: number, discrepancies  : any[] }> {
    this.logger.log(`Starting billing reconciliation for tenant ${tenantId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const localInvoices = await this.invoiceRepository.findByTenantAndDateRange(tenantId, startDate, endDate);

    // This is a simplified reconciliation logic.
    // In production, this would call the Fiscal Provider's "fetchRemoteInvoices" method
    // and compare UUIDs, amounts, and statuses.

    const discrepancies  : any[] = [];
    let matched = 0;

    for (const invoice of localInvoices) {
        if (!invoice.fiscalUuid) {
            discrepancies.push({ invoiceId: invoice.id, reason: 'Missing fiscal stamp' });
        } else {
            matched++;
        }
    }

    this.logger.log(`Reconciliation completed. Matched: ${matched}, Discrepancies: ${discrepancies.length}`);

    return { matched, discrepancies };
  }
}
