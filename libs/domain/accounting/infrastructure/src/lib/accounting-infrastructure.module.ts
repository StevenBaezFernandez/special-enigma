import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ACCOUNT_REPOSITORY, JOURNAL_ENTRY_REPOSITORY, JournalEntry, JournalEntryLine, FiscalYear } from '@virteex/domain-accounting-domain';
import { MikroOrmAccountRepository } from './repositories/mikro-orm-account.repository';
import { MikroOrmJournalEntryRepository } from './repositories/mikro-orm-journal-entry.repository';
import { AccountSchema } from './persistence/mappings/account.mapping';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([AccountSchema, JournalEntry, JournalEntryLine, FiscalYear]),
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
