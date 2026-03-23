import { Module } from '@nestjs/common';
import { ACCOUNT_REPOSITORY, JOURNAL_ENTRY_REPOSITORY } from '@virteex/domain-accounting-domain';
import { AccountingPolicyService } from './services/accounting-policy.service';
import { AccountingEventHandlerService } from './services/accounting-event-handler.service';
import { AccountingListener } from './listeners/accounting.listener';
import {
  CreateAccountUseCase,
  RecordJournalEntryUseCase,
  GetAccountsUseCase,
  GetJournalEntriesUseCase,
  SetupChartOfAccountsUseCase,
  GenerateFinancialReportUseCase,
  CloseFiscalPeriodUseCase,
} from './use-cases/index';

@Module({
  providers: [
    AccountingPolicyService,
    AccountingEventHandlerService,
    AccountingListener,
    {
      provide: CreateAccountUseCase,
      useFactory: (repo) => new CreateAccountUseCase(repo),
      inject: [ACCOUNT_REPOSITORY],
    },
    {
      provide: RecordJournalEntryUseCase,
      useFactory: (jeRepo, accRepo) => new RecordJournalEntryUseCase(jeRepo, accRepo),
      inject: [JOURNAL_ENTRY_REPOSITORY, ACCOUNT_REPOSITORY],
    },
    {
      provide: GetAccountsUseCase,
      useFactory: (repo) => new GetAccountsUseCase(repo),
      inject: [ACCOUNT_REPOSITORY],
    },
    {
      provide: GetJournalEntriesUseCase,
      useFactory: (repo) => new GetJournalEntriesUseCase(repo),
      inject: [JOURNAL_ENTRY_REPOSITORY],
    },
    {
      provide: SetupChartOfAccountsUseCase,
      useFactory: (repo) => new SetupChartOfAccountsUseCase(repo),
      inject: [ACCOUNT_REPOSITORY],
    },
    {
      provide: GenerateFinancialReportUseCase,
      useFactory: (jeRepo, accRepo) => new GenerateFinancialReportUseCase(jeRepo, accRepo),
      inject: [JOURNAL_ENTRY_REPOSITORY, ACCOUNT_REPOSITORY],
    },
    {
      provide: CloseFiscalPeriodUseCase,
      useFactory: (jeRepo, accRepo, policySvc) => new CloseFiscalPeriodUseCase(jeRepo, accRepo, policySvc),
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
