import { Module } from '@nestjs/common';
import { AccountingApplicationWiringModule } from '@virteex/domain-accounting-infrastructure';
import { AccountsResolver } from '../graphql/accounts.resolver';
import { JournalEntriesResolver } from '../graphql/journal-entries.resolver';
import { AccountLoader } from '../graphql/account.loader';

@Module({
  imports: [AccountingApplicationWiringModule],
  providers: [
    AccountsResolver,
    JournalEntriesResolver,
    AccountLoader,
  ],
  exports: [AccountLoader],
})
export class AccountingGraphqlModule {}
