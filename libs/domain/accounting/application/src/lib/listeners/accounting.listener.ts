import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SetupChartOfAccountsUseCase } from '../use-cases/setup-chart-of-accounts.use-case';
import { AccountingEventHandlerService } from '../services/accounting-event-handler.service';

@Injectable()
export class AccountingListener {
  private readonly logger = new Logger(AccountingListener.name);

  constructor(
    private readonly setupChartOfAccountsUseCase: SetupChartOfAccountsUseCase,
    private readonly eventHandlerService: AccountingEventHandlerService
  ) {}

  @OnEvent('tenant.created')
  async handleTenantCreated(event: { tenantId: string }) {
    this.logger.log(`Initializing Accounting Domain for new tenant: ${event.tenantId}`);
    try {
        await this.setupChartOfAccountsUseCase.execute(event.tenantId);
        this.logger.log(`Chart of Accounts initialized for tenant: ${event.tenantId}`);
    } catch (e) {
        const error = e as Error;
        this.logger.error(`Failed to initialize Chart of Accounts: ${error.message}`);
    }
  }

  @OnEvent('invoice.stamped')
  async handleInvoiceStamped(event: any) {
    try {
        await this.eventHandlerService.handleInvoiceStamped(event);
        this.logger.log(`Journal Entry created for Invoice ${event.invoiceId}`);
    } catch (e) {
        const error = e as Error;
        this.logger.error(`Failed to create Journal Entry for Invoice ${event.invoiceId}: ${error.message}`);
    }
  }

  @OnEvent('payroll.stamped')
  async handlePayrollStamped(event: any) {
    try {
        await this.eventHandlerService.handlePayrollStamped(event);
        this.logger.log(`Journal Entry created for Payroll ${event.payrollId}`);
    } catch (e) {
        const error = e as Error;
        this.logger.error(`Failed to create Journal Entry for Payroll ${event.payrollId}: ${error.message}`);
    }
  }
}
