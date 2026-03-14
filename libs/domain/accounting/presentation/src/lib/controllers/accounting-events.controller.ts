import { Controller, Logger, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RecordJournalEntryUseCase } from '@virteex/domain-accounting-application';
import { ACCOUNT_REPOSITORY, type AccountRepository } from '@virteex/domain-accounting-domain';
import { ACCOUNT_REPOSITORY, type AccountRepository } from '@virteex/domain-accounting-domain';
import { type RecordJournalEntryDto } from '@virteex/domain-accounting-contracts';

interface InvoiceValidatedEvent {
    id: string;
    tenantId: string;
    totalAmount: string;
    taxAmount: string;
    stampedAt: string | Date;
}

@Controller()
export class AccountingEventsController {
  private readonly logger = new Logger(AccountingEventsController.name);

  constructor(
    private readonly recordJournalEntryUseCase: RecordJournalEntryUseCase,
    @Inject(ACCOUNT_REPOSITORY) private readonly accountRepo: AccountRepository
  ) {}

  @EventPattern('billing.invoice.validated')
  async handleInvoiceValidated(@Payload() event: InvoiceValidatedEvent) {
    this.logger.log(`Processing accounting for Invoice ${event.id}`);

    const salesAccount = await this.accountRepo.findByCode(event.tenantId, '401.01');
    const vatAccount = await this.accountRepo.findByCode(event.tenantId, '208.01');
    const clientAccount = await this.accountRepo.findByCode(event.tenantId, '105.01');

    if (!salesAccount || !vatAccount || !clientAccount) {
        this.logger.warn(`Missing accounting codes (401.01, 208.01, 105.01) for tenant ${event.tenantId}. Skipping journal entry.`);
        return;
    }

    const total = Number(event.totalAmount);
    const taxes = Number(event.taxAmount);
    const subtotal = total - taxes;

    const dto: RecordJournalEntryDto = {
        tenantId: event.tenantId,
        date: new Date(event.stampedAt),
        description: `Venta Factura ${event.id}`,
        lines: [
            { accountId: clientAccount.id, debit: total.toFixed(2), credit: '0.00', description: 'Cargo a Clientes' },
            { accountId: salesAccount.id, debit: '0.00', credit: subtotal.toFixed(2), description: 'Abono a Ventas' },
            { accountId: vatAccount.id, debit: '0.00', credit: taxes.toFixed(2), description: 'Abono a IVA' }
        ]
    };

    try {
        await this.recordJournalEntryUseCase.execute(dto);
        this.logger.log(`Journal Entry created for Invoice ${event.id}`);
    } catch (e) {
        const error = e as Error;
        this.logger.error(`Failed to create Journal Entry for Invoice ${event.id}: ${error.message}`);
    }
  }
}
