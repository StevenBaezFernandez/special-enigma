import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SetupChartOfAccountsUseCase, AccountingEventHandlerService } from '@virteex/domain-accounting-application';

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

}
