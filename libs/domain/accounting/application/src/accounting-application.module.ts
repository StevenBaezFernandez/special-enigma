import { Module } from '@nestjs/common';
import { ACCOUNT_REPOSITORY, JOURNAL_ENTRY_REPOSITORY, AccountRepository, JournalEntryRepository } from '@virteex/domain-accounting-domain';
import { AccountingPolicyService } from './services/accounting-policy.service';
import { AccountingEventHandlerService } from './services/accounting-event-handler.service';
import { AccountingListener } from './handlers/accounting.listener';
import { CreateAccountUseCase } from './use-cases/accounts/create-account.use-case';
import { RecordJournalEntryUseCase } from './use-cases/journal-entries/record-journal-entry.use-case';
import { GetAccountsUseCase } from './use-cases/accounts/get-accounts.use-case';
import { GetJournalEntriesUseCase } from './use-cases/journal-entries/get-journal-entries.use-case';
import { SetupChartOfAccountsUseCase } from './use-cases/accounts/setup-chart-of-accounts.use-case';
import { GenerateFinancialReportUseCase } from './use-cases/reports/generate-financial-report.use-case';
import { CloseFiscalPeriodUseCase } from './use-cases/fiscal-periods/close-fiscal-period.use-case';

@Module({
  providers: [
    AccountingPolicyService,
    AccountingEventHandlerService,
    AccountingListener,
    {
      provide: CreateAccountUseCase,
      useFactory: (repo: AccountRepository) => new CreateAccountUseCase(repo),
      inject: [ACCOUNT_REPOSITORY],
    },
    {
      provide: RecordJournalEntryUseCase,
      useFactory: (jeRepo: JournalEntryRepository, accRepo: AccountRepository) => new RecordJournalEntryUseCase(jeRepo, accRepo),
      inject: [JOURNAL_ENTRY_REPOSITORY, ACCOUNT_REPOSITORY],
    },
    {
      provide: GetAccountsUseCase,
      useFactory: (accRepo: AccountRepository, jeRepo: JournalEntryRepository) => new GetAccountsUseCase(accRepo, jeRepo),
      inject: [ACCOUNT_REPOSITORY, JOURNAL_ENTRY_REPOSITORY],
    },
    {
      provide: GetJournalEntriesUseCase,
      useFactory: (repo: JournalEntryRepository) => new GetJournalEntriesUseCase(repo),
      inject: [JOURNAL_ENTRY_REPOSITORY],
    },
    {
      provide: SetupChartOfAccountsUseCase,
      useFactory: (repo: AccountRepository) => new SetupChartOfAccountsUseCase(repo),
      inject: [ACCOUNT_REPOSITORY],
    },
    {
      provide: GenerateFinancialReportUseCase,
      useFactory: (jeRepo: JournalEntryRepository, accRepo: AccountRepository) => new GenerateFinancialReportUseCase(jeRepo, accRepo),
      inject: [JOURNAL_ENTRY_REPOSITORY, ACCOUNT_REPOSITORY],
    },
    {
      provide: CloseFiscalPeriodUseCase,
      useFactory: (jeRepo: JournalEntryRepository, accRepo: AccountRepository, policySvc: AccountingPolicyService) => new CloseFiscalPeriodUseCase(jeRepo, accRepo, policySvc),
      inject: [JOURNAL_ENTRY_REPOSITORY, ACCOUNT_REPOSITORY, AccountingPolicyService],
    },
  ],
  exports: [
    AccountingPolicyService,
    AccountingEventHandlerService,
    CreateAccountUseCase,
    RecordJournalEntryUseCase,
    GetAccountsUseCase,
    GetJournalEntriesUseCase,
    SetupChartOfAccountsUseCase,
    GenerateFinancialReportUseCase,
    CloseFiscalPeriodUseCase,
  ],
})
export class AccountingApplicationModule {}
