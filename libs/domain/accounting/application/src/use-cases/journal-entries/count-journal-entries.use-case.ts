import { type JournalEntryRepository } from '@virteex/domain-accounting-domain';

export class CountJournalEntriesUseCase {
  constructor(
    private journalEntryRepository: JournalEntryRepository
  ) {}

  async execute(tenantId: string): Promise<number> {
    return this.journalEntryRepository.count(tenantId);
  }
}
