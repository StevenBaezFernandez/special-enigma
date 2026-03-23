import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { RecordJournalEntryUseCase, GetJournalEntriesUseCase } from '@virteex/domain-accounting-application';
import { CurrentTenant } from '@virteex/kernel-auth';
import { JournalEntryObject } from '../dto/journal-entry.object';
import { RecordJournalEntryInput } from '../dto/record-journal-entry.input';

@Resolver(() => JournalEntryObject)
export class JournalEntriesResolver {
  constructor(
    private readonly recordJournalEntryUseCase: RecordJournalEntryUseCase,
    private readonly getJournalEntriesUseCase: GetJournalEntriesUseCase
  ) {}

  @Mutation(() => JournalEntryObject)
  async recordJournalEntry(
    @CurrentTenant() tenantId: string,
    @Args('input') input: RecordJournalEntryInput
  ) {
    return this.recordJournalEntryUseCase.execute({ ...input, tenantId });
  }

  @Query(() => [JournalEntryObject], { name: 'journalEntries' })
  async getJournalEntries(@CurrentTenant() tenantId: string) {
    return this.getJournalEntriesUseCase.execute(tenantId);
  }
}
