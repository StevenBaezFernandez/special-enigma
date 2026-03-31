import { Global, Module, Logger } from '@nestjs/common';
import { AccountingInfrastructureModule } from './accounting-infrastructure.module';
import {
  ACCOUNT_REPOSITORY,
  JOURNAL_ENTRY_REPOSITORY,
  OUTBOX_REPOSITORY,
  POLICY_REPOSITORY,
  FISCAL_PERIOD_REPOSITORY,
  CLOSING_TASK_REPOSITORY,
  AccountRepository,
  JournalEntryRepository,
  OutboxRepository,
  PolicyRepository,
  FiscalPeriodRepository,
  ClosingTaskRepository,
} from '@virteex/domain-accounting-domain';
import {
  TELEMETRY_SERVICE,
  type ITelemetryService,
} from '@virteex/kernel-telemetry';
import {
  I_UNIT_OF_WORK,
  IUnitOfWork,
  DimensionValidator,
  AccountingPolicyService,
  AccountingEventHandlerService,
  CreateAccountUseCase,
  RecordJournalEntryUseCase,
  GetAccountsUseCase,
  GetJournalEntriesUseCase,
  GetAccountsByIdsUseCase,
  CountJournalEntriesUseCase,
  SetupChartOfAccountsUseCase,
  GenerateFinancialReportUseCase,
  GetMonthlyOpexUseCase,
  CloseFiscalPeriodUseCase,
  ConsolidateAccountsUseCase,
  AccountingCommandFacade,
  AccountingQueryFacade,
} from '@virteex/domain-accounting-application';

@Global()
@Module({
  imports: [AccountingInfrastructureModule],
  providers: [
    AccountingCommandFacade,
    {
      provide: AccountingQueryFacade,
      useFactory: (
        getAcc: GetAccountsUseCase,
        getJE: GetJournalEntriesUseCase,
        countJE: CountJournalEntriesUseCase,
        genReport: GenerateFinancialReportUseCase,
        getOpex: GetMonthlyOpexUseCase,
      ) =>
        new AccountingQueryFacade(
          getAcc,
          getJE,
          countJE,
          genReport,
          getOpex,
        ),
      inject: [
        GetAccountsUseCase,
        GetJournalEntriesUseCase,
        CountJournalEntriesUseCase,
        GenerateFinancialReportUseCase,
        GetMonthlyOpexUseCase,
      ],
    },
    {
      provide: DimensionValidator,
      useValue: new DimensionValidator(),
    },
    {
      provide: AccountingPolicyService,
      useFactory: (repo?: PolicyRepository) =>
        new AccountingPolicyService(repo),
      inject: [{ token: POLICY_REPOSITORY, optional: true }],
    },
    {
      provide: AccountingEventHandlerService,
      useFactory: (
        recordJE: RecordJournalEntryUseCase,
        policy: AccountingPolicyService,
        accRepo: AccountRepository,
      ) => {
        const nestLogger = new Logger(AccountingEventHandlerService.name);
        return new AccountingEventHandlerService(recordJE, policy, accRepo, {
          debug: (msg, ...args) => nestLogger.debug(msg, ...args),
          info: (msg, ...args) => nestLogger.log(msg, ...args),
          warn: (msg, ...args) => nestLogger.warn(msg, ...args),
          error: (msg, ...args) => nestLogger.error(msg, ...args),
        });
      },
      inject: [
        RecordJournalEntryUseCase,
        AccountingPolicyService,
        ACCOUNT_REPOSITORY,
      ],
    },
    {
      provide: CreateAccountUseCase,
      useFactory: (
        repo: AccountRepository,
        outbox: OutboxRepository,
        telemetry: ITelemetryService,
      ) => new CreateAccountUseCase(repo, outbox, telemetry),
      inject: [ACCOUNT_REPOSITORY, OUTBOX_REPOSITORY, TELEMETRY_SERVICE],
    },
    {
      provide: RecordJournalEntryUseCase,
      useFactory: (
        jeRepo: JournalEntryRepository,
        accRepo: AccountRepository,
        telemetry: ITelemetryService,
        uow: IUnitOfWork,
      ) => new RecordJournalEntryUseCase(jeRepo, accRepo, telemetry, uow),
      inject: [
        JOURNAL_ENTRY_REPOSITORY,
        ACCOUNT_REPOSITORY,
        TELEMETRY_SERVICE,
        I_UNIT_OF_WORK,
      ],
    },
    {
      provide: GetAccountsUseCase,
      useFactory: (
        accRepo: AccountRepository,
        jeRepo: JournalEntryRepository,
      ) => new GetAccountsUseCase(accRepo, jeRepo),
      inject: [ACCOUNT_REPOSITORY, JOURNAL_ENTRY_REPOSITORY],
    },
    {
      provide: GetJournalEntriesUseCase,
      useFactory: (repo: JournalEntryRepository) =>
        new GetJournalEntriesUseCase(repo),
      inject: [JOURNAL_ENTRY_REPOSITORY],
    },
    {
      provide: GetAccountsByIdsUseCase,
      useFactory: (
        accRepo: AccountRepository,
        jeRepo: JournalEntryRepository,
      ) => new GetAccountsByIdsUseCase(accRepo, jeRepo),
      inject: [ACCOUNT_REPOSITORY, JOURNAL_ENTRY_REPOSITORY],
    },
    {
      provide: CountJournalEntriesUseCase,
      useFactory: (repo: JournalEntryRepository) =>
        new CountJournalEntriesUseCase(repo),
      inject: [JOURNAL_ENTRY_REPOSITORY],
    },
    {
      provide: GetMonthlyOpexUseCase,
      useFactory: (jeRepo: JournalEntryRepository, accRepo: AccountRepository) =>
        new GetMonthlyOpexUseCase(jeRepo, accRepo),
      inject: [JOURNAL_ENTRY_REPOSITORY, ACCOUNT_REPOSITORY],
    },
    {
      provide: SetupChartOfAccountsUseCase,
      useFactory: (repo: AccountRepository) =>
        new SetupChartOfAccountsUseCase(repo),
      inject: [ACCOUNT_REPOSITORY],
    },
    {
      provide: GenerateFinancialReportUseCase,
      useFactory: (
        jeRepo: JournalEntryRepository,
        accRepo: AccountRepository,
      ) => new GenerateFinancialReportUseCase(jeRepo, accRepo),
      inject: [JOURNAL_ENTRY_REPOSITORY, ACCOUNT_REPOSITORY],
    },
    {
      provide: CloseFiscalPeriodUseCase,
      useFactory: (
        jeRepo: JournalEntryRepository,
        accRepo: AccountRepository,
        fpRepo: FiscalPeriodRepository,
        ctRepo: ClosingTaskRepository,
        policySvc: AccountingPolicyService,
      ) => new CloseFiscalPeriodUseCase(jeRepo, accRepo, fpRepo, ctRepo, policySvc),
      inject: [
        JOURNAL_ENTRY_REPOSITORY,
        ACCOUNT_REPOSITORY,
        { token: FISCAL_PERIOD_REPOSITORY, optional: true },
        { token: CLOSING_TASK_REPOSITORY, optional: true },
        AccountingPolicyService,
      ],
    },
    {
      provide: ConsolidateAccountsUseCase,
      useFactory: (
        jeRepo: JournalEntryRepository,
        accRepo: AccountRepository,
        policyRepo: PolicyRepository,
      ) => new ConsolidateAccountsUseCase(jeRepo, accRepo, policyRepo),
      inject: [
        JOURNAL_ENTRY_REPOSITORY,
        ACCOUNT_REPOSITORY,
        POLICY_REPOSITORY,
      ],
    },
  ],
  exports: [
    AccountingPolicyService,
    AccountingEventHandlerService,
    DimensionValidator,
    CreateAccountUseCase,
    RecordJournalEntryUseCase,
    GetAccountsUseCase,
    GetAccountsByIdsUseCase,
    GetJournalEntriesUseCase,
    CountJournalEntriesUseCase,
    SetupChartOfAccountsUseCase,
    GenerateFinancialReportUseCase,
    CloseFiscalPeriodUseCase,
    ConsolidateAccountsUseCase,
    AccountingCommandFacade,
    AccountingQueryFacade,
  ],
})
export class AccountingApplicationWiringModule {}
