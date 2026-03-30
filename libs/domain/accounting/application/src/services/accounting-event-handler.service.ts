import { RecordJournalEntryUseCase } from '../use-cases/journal-entries/record-journal-entry.use-case';
import { type AccountRepository } from '@virteex/domain-accounting-domain';
import { type RecordJournalEntryDto } from '@virteex/domain-accounting-contracts';
import { AccountingPolicyService } from './accounting-policy.service';

interface ILogger {
  log(message: string): void;
  warn(message: string): void;
  error(message: string, trace?: string): void;
}

interface InvoiceStampedEvent {
    invoiceId: string;
    tenantId: string;
    total: number;
    taxes: number;
    date: Date;
}

interface PayrollStampedEvent {
    payrollId: string;
    tenantId: string;
    netPay: number;
    taxes: number;
    date: Date;
}

export class AccountingEventHandlerService {
  constructor(
    private readonly recordJournalEntryUseCase: RecordJournalEntryUseCase,
    private readonly policyService: AccountingPolicyService,
    private readonly accountRepo: AccountRepository,
    private readonly logger: ILogger = console
  ) {}

  async handleInvoiceStamped(event: InvoiceStampedEvent) {
    this.logger.log(`Processing accounting for Invoice ${event.invoiceId}`);

    const policy = await this.policyService.resolveAccountsForInvoice(event.tenantId);

    const salesAccount = await this.accountRepo.findByCode(event.tenantId, policy['salesAccountCode']);
    const vatAccount = await this.accountRepo.findByCode(event.tenantId, policy['vatAccountCode']);
    const clientAccount = await this.accountRepo.findByCode(event.tenantId, policy['clientAccountCode']);

    if (!salesAccount || !vatAccount || !clientAccount) {
        this.logger.warn(`Missing accounting codes for tenant ${event.tenantId}. Skipping journal entry.`);
        return;
    }

    const dto: RecordJournalEntryDto & { tenantId: string } = {
        tenantId: event.tenantId,
        date: event.date.toISOString(),
        description: `Venta Factura ${event.invoiceId}`,
        lines: [
            { accountId: clientAccount.id, debit: Number(event.total).toFixed(2), credit: '0.00', description: 'Cargo a Clientes' },
            { accountId: salesAccount.id, debit: '0.00', credit: (Number(event.total) - Number(event.taxes)).toFixed(2), description: 'Abono a Ventas' },
            { accountId: vatAccount.id, debit: '0.00', credit: Number(event.taxes).toFixed(2), description: 'Abono a IVA' }
        ]
    };

    await this.recordJournalEntryUseCase.execute(dto);
  }

  async handlePayrollStamped(event: PayrollStampedEvent) {
    this.logger.log(`Processing accounting for Payroll ${event.payrollId}`);

    const policy = await this.policyService.resolveAccountsForPayroll(event.tenantId);

    const salaryExpenseAccount = await this.accountRepo.findByCode(event.tenantId, policy['salaryExpenseAccountCode']);
    const taxPayableAccount = await this.accountRepo.findByCode(event.tenantId, policy['taxPayableAccountCode']);
    const bankAccount = await this.accountRepo.findByCode(event.tenantId, policy['bankAccountCode']);

    if (!salaryExpenseAccount || !taxPayableAccount || !bankAccount) {
        this.logger.warn(`Missing accounting codes for tenant ${event.tenantId}. Skipping payroll entry.`);
        return;
    }

    const totalEarnings = Number(event.netPay) + Number(event.taxes);

    const dto: RecordJournalEntryDto & { tenantId: string } = {
        tenantId: event.tenantId,
        date: event.date.toISOString(),
        description: `Nómina ${event.payrollId}`,
        lines: [
            { accountId: salaryExpenseAccount.id, debit: totalEarnings.toFixed(2), credit: '0.00', description: 'Gasto por Sueldos' },
            { accountId: bankAccount.id, debit: '0.00', credit: Number(event.netPay).toFixed(2), description: 'Salida de Banco' },
            { accountId: taxPayableAccount.id, debit: '0.00', credit: Number(event.taxes).toFixed(2), description: 'ISR por Pagar' }
        ]
    };

    await this.recordJournalEntryUseCase.execute(dto);
  }
}
