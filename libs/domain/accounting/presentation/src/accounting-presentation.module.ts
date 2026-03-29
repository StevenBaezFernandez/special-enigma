import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { AccountingApplicationModule } from '@virteex/domain-accounting-application';
import { AccountingController } from './http/controllers/accounting.controller';
import { AccountingHealthController } from './http/controllers/accounting-health.controller';
import { AccountingEventsController } from './http/controllers/accounting-events.controller';
import { AccountsResolver } from './graphql/accounts.resolver';
import { JournalEntriesResolver } from './graphql/journal-entries.resolver';
import { AccountLoader } from './graphql/account.loader';
import { AccountingExceptionFilter } from './filters/accounting-exception.filter';
import { TenantGuard } from './guards/tenant.guard';
import { PresentationLoggingInterceptor } from './interceptors/presentation-logging.interceptor';

@Module({
  imports: [AccountingApplicationModule, TerminusModule],
  controllers: [AccountingController, AccountingEventsController, AccountingHealthController],
  providers: [
    AccountsResolver,
    JournalEntriesResolver,
    AccountLoader,
    {
      provide: APP_FILTER,
      useClass: AccountingExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PresentationLoggingInterceptor,
    },
  ],
  exports: [AccountLoader]
})
export class AccountingPresentationModule {}
