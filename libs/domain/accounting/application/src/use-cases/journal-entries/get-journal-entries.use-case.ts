import { type JournalEntryDto } from '@virteex/domain-accounting-contracts';
import { JournalEntryMapper } from '../../mappers/journal-entry.mapper';
import { type JournalEntryRepository } from '@virteex/domain-accounting-domain';

export class GetJournalEntriesUseCase {
  constructor(
    private journalEntryRepository: JournalEntryRepository
  ) {}

  async execute(tenantId: string): Promise<JournalEntryDto[]> {
    const entries = await this.journalEntryRepository.findAll(tenantId);
    return entries.map(JournalEntryMapper.toDto);
  }
}
