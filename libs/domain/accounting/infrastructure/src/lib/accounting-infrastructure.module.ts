import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ACCOUNT_REPOSITORY, JOURNAL_ENTRY_REPOSITORY } from '@virteex/domain-accounting-domain';
import { MikroOrmAccountRepository } from './repositories/mikro-orm-account.repository';
import { MikroOrmJournalEntryRepository } from './repositories/mikro-orm-journal-entry.repository';
import { AccountSchema, JournalEntrySchema, JournalEntryLineSchema, FiscalYearSchema } from './persistence/mikro-orm.schemas';
import {
  CreateAccountUseCase,
  RecordJournalEntryUseCase,
  GetAccountsUseCase,
  GetJournalEntriesUseCase,
  SetupChartOfAccountsUseCase,
  GenerateFinancialReportUseCase,
  CloseFiscalPeriodUseCase,
} from '@virteex/domain-accounting-application';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([AccountSchema, JournalEntrySchema, JournalEntryLineSchema, FiscalYearSchema]),
  ],
  providers: [
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: MikroOrmAccountRepository,
    },
    {
      provide: JOURNAL_ENTRY_REPOSITORY,
      useClass: MikroOrmJournalEntryRepository,
    },
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
      useFactory: (jeRepo, accRepo) => new CloseFiscalPeriodUseCase(jeRepo, accRepo),
      inject: [JOURNAL_ENTRY_REPOSITORY, ACCOUNT_REPOSITORY],
    },
  ],
  exports: [
    ACCOUNT_REPOSITORY,
    JOURNAL_ENTRY_REPOSITORY,
    CreateAccountUseCase,
    RecordJournalEntryUseCase,
    GetAccountsUseCase,
    GetJournalEntriesUseCase,
    SetupChartOfAccountsUseCase,
    GenerateFinancialReportUseCase,
    CloseFiscalPeriodUseCase,
    MikroOrmModule
  ],
})
export class AccountingInfrastructureModule {}
