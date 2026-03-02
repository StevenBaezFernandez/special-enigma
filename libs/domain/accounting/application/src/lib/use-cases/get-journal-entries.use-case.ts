import { Inject, Injectable } from '@nestjs/common';
import { JOURNAL_ENTRY_REPOSITORY, JournalEntryRepository } from '@virteex/domain-accounting-domain';
import { JournalEntryDto } from '@virteex/domain-accounting-contracts';
import { JournalEntryMapper } from '../mappers/journal-entry.mapper';

@Injectable()
export class GetJournalEntriesUseCase {
  constructor(
    @Inject(JOURNAL_ENTRY_REPOSITORY) private journalEntryRepository: JournalEntryRepository
  ) {}

  async execute(tenantId: string): Promise<JournalEntryDto[]> {
    const entries = await this.journalEntryRepository.findAll(tenantId);
    return entries.map(JournalEntryMapper.toDto);
  }
}
