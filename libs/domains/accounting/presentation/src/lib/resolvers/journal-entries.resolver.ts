import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { RecordJournalEntryUseCase, GetJournalEntriesUseCase } from '@virteex/application-accounting-application';
import { JournalEntryObject } from '../dto/journal-entry.object';
import { RecordJournalEntryInput } from '../dto/record-journal-entry.input';

@Resolver(() => JournalEntryObject)
export class JournalEntriesResolver {
  constructor(
    private readonly recordJournalEntryUseCase: RecordJournalEntryUseCase,
    private readonly getJournalEntriesUseCase: GetJournalEntriesUseCase
  ) {}

  @Mutation(() => JournalEntryObject)
  async recordJournalEntry(@Args('input') input: RecordJournalEntryInput) {
    return this.recordJournalEntryUseCase.execute(input);
  }

  @Query(() => [JournalEntryObject], { name: 'journalEntries' })
  async getJournalEntries(@Args('tenantId') tenantId: string) {
    return this.getJournalEntriesUseCase.execute(tenantId);
  }
}
