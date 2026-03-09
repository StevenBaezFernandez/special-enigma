import { Module } from '@nestjs/common';
import { CreateAccountUseCase } from './use-cases/create-account.use-case';
import { SetupChartOfAccountsUseCase } from './use-cases/setup-chart-of-accounts.use-case';
import { RecordJournalEntryUseCase } from './use-cases/record-journal-entry.use-case';
import { GetAccountsUseCase } from './use-cases/get-accounts.use-case';
import { GetJournalEntriesUseCase } from './use-cases/get-journal-entries.use-case';
import { AccountingListener } from './listeners/accounting.listener';

@Module({
  imports: [],
  providers: [
    CreateAccountUseCase,
    SetupChartOfAccountsUseCase,
    RecordJournalEntryUseCase,
    GetAccountsUseCase,
    GetJournalEntriesUseCase,
    AccountingListener
  ],
  exports: [
    CreateAccountUseCase,
    SetupChartOfAccountsUseCase,
    RecordJournalEntryUseCase,
    GetAccountsUseCase,
    GetJournalEntriesUseCase
  ],
})
export class AccountingApplicationModule {}
