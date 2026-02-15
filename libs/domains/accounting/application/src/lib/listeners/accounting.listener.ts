import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RecordJournalEntryUseCase } from '../use-cases/record-journal-entry.use-case';
import { AccountRepository, ACCOUNT_REPOSITORY } from '../../../../domain/src/index';
// Remove imports to avoid build cycles/rootDir issues
// import { InvoiceStampedEvent } from '@virteex/billing-domain';
// import { PayrollStampedEvent } from '@virteex/payroll-domain';
import { RecordJournalEntryDto } from '@virteex/accounting-contracts';

// Local definitions for Duck Typing
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

@Injectable()
export class AccountingListener {
  private readonly logger = new Logger(AccountingListener.name);

  constructor(
    private readonly recordJournalEntryUseCase: RecordJournalEntryUseCase,
    @Inject(ACCOUNT_REPOSITORY) private readonly accountRepo: AccountRepository
  ) {}

  @OnEvent('invoice.stamped')
  async handleInvoiceStamped(event: InvoiceStampedEvent) {
    this.logger.log(`Processing accounting for Invoice ${event.invoiceId}`);

    const salesAccount = await this.accountRepo.findByCode(event.tenantId, '401.01');
    const vatAccount = await this.accountRepo.findByCode(event.tenantId, '208.01');
    const clientAccount = await this.accountRepo.findByCode(event.tenantId, '105.01');

    if (!salesAccount || !vatAccount || !clientAccount) {
        this.logger.warn(`Missing accounting codes (401.01, 208.01, 105.01) for tenant ${event.tenantId}. Skipping journal entry.`);
        return;
    }

    const dto: RecordJournalEntryDto = {
        tenantId: event.tenantId,
        date: event.date,
        description: `Venta Factura ${event.invoiceId}`,
        lines: [
            { accountId: clientAccount.id, debit: Number(event.total).toFixed(2), credit: '0.00', description: 'Cargo a Clientes' },
            { accountId: salesAccount.id, debit: '0.00', credit: (Number(event.total) - Number(event.taxes)).toFixed(2), description: 'Abono a Ventas' },
            { accountId: vatAccount.id, debit: '0.00', credit: Number(event.taxes).toFixed(2), description: 'Abono a IVA' }
        ]
    };

    try {
        await this.recordJournalEntryUseCase.execute(dto);
        this.logger.log(`Journal Entry created for Invoice ${event.invoiceId}`);
    } catch (e: any) {
        this.logger.error(`Failed to create Journal Entry for Invoice ${event.invoiceId}: ${e.message}`);
    }
  }

  @OnEvent('payroll.stamped')
  async handlePayrollStamped(event: PayrollStampedEvent) {
    this.logger.log(`Processing accounting for Payroll ${event.payrollId}`);

    const salaryExpenseAccount = await this.accountRepo.findByCode(event.tenantId, '601.01');
    const taxPayableAccount = await this.accountRepo.findByCode(event.tenantId, '210.01');
    const bankAccount = await this.accountRepo.findByCode(event.tenantId, '102.01');

    if (!salaryExpenseAccount || !taxPayableAccount || !bankAccount) {
        this.logger.warn(`Missing accounting codes (601.01, 210.01, 102.01) for tenant ${event.tenantId}. Skipping payroll entry.`);
        return;
    }

    const totalEarnings = Number(event.netPay) + Number(event.taxes);

    const dto: RecordJournalEntryDto = {
        tenantId: event.tenantId,
        date: event.date,
        description: `Nómina ${event.payrollId}`,
        lines: [
            { accountId: salaryExpenseAccount.id, debit: totalEarnings.toFixed(2), credit: '0.00', description: 'Gasto por Sueldos' },
            { accountId: bankAccount.id, debit: '0.00', credit: Number(event.netPay).toFixed(2), description: 'Salida de Banco' },
            { accountId: taxPayableAccount.id, debit: '0.00', credit: Number(event.taxes).toFixed(2), description: 'ISR por Pagar' }
        ]
    };

    try {
        await this.recordJournalEntryUseCase.execute(dto);
        this.logger.log(`Journal Entry created for Payroll ${event.payrollId}`);
    } catch (e: any) {
        this.logger.error(`Failed to create Journal Entry for Payroll ${event.payrollId}: ${e.message}`);
    }
  }
}
