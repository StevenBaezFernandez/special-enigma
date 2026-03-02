import { Module } from '@nestjs/common';
import { AccountingApplicationModule } from '@virteex/domain-accounting-application';
import { AccountingInfrastructureModule } from '@virteex/domain-accounting-infrastructure';
import { AccountingController } from './controllers/accounting.controller';
import { AccountingEventsController } from './controllers/accounting-events.controller';
import { AccountsResolver } from './resolvers/accounts.resolver';
import { JournalEntriesResolver } from './resolvers/journal-entries.resolver';

@Module({
  imports: [AccountingApplicationModule, AccountingInfrastructureModule],
  controllers: [AccountingController, AccountingEventsController],
  providers: [AccountsResolver, JournalEntriesResolver],
})
export class AccountingPresentationModule {}
