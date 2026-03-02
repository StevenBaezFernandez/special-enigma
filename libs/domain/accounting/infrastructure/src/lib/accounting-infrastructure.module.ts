import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ACCOUNT_REPOSITORY, JOURNAL_ENTRY_REPOSITORY } from '@virteex/domain-accounting-domain';
import { MikroOrmAccountRepository } from './repositories/mikro-orm-account.repository';
import { MikroOrmJournalEntryRepository } from './repositories/mikro-orm-journal-entry.repository';
import { AccountSchema, JournalEntrySchema, JournalEntryLineSchema, FiscalYearSchema } from './persistence/mikro-orm.schemas';

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
  ],
  exports: [
    ACCOUNT_REPOSITORY,
    JOURNAL_ENTRY_REPOSITORY,
    MikroOrmModule
  ],
})
export class AccountingInfrastructureModule {}
