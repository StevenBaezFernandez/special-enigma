import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AccountingApplicationModule } from '@virteex/domain-accounting-application';
import { AccountingController } from './controllers/accounting.controller';
import { AccountingHealthController } from './controllers/accounting-health.controller';
import { AccountingEventsController } from './controllers/accounting-events.controller';
import { AccountsResolver } from './resolvers/accounts.resolver';
import { JournalEntriesResolver } from './resolvers/journal-entries.resolver';
import { AccountLoader } from './loaders/account.loader';

@Module({
  imports: [AccountingApplicationModule, TerminusModule],
  controllers: [AccountingController, AccountingEventsController, AccountingHealthController],
  providers: [AccountsResolver, JournalEntriesResolver, AccountLoader],
  exports: [AccountLoader]
})
export class AccountingPresentationModule {}
