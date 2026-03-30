import { Module } from '@nestjs/common';
import { AccountsResolver } from '../graphql/accounts.resolver';
import { JournalEntriesResolver } from '../graphql/journal-entries.resolver';
import { AccountLoader } from '../graphql/account.loader';

@Module({
  imports: [],
  providers: [
    AccountsResolver,
    JournalEntriesResolver,
    AccountLoader,
  ],
  exports: [AccountLoader],
})
export class AccountingGraphqlModule {}
