import { JournalEntry, JournalEntryLine, type JournalEntryRepository, type AccountRepository, AccountNotFoundError, CrossTenantAccessError, PeriodClosedError } from '@virteex/domain-accounting-domain';
import { type RecordJournalEntryDto, type JournalEntryDto } from '@virteex/domain-accounting-contracts';
import { JournalEntryMapper } from '../mappers/journal-entry.mapper';

export class RecordJournalEntryUseCase {
  constructor(
    private journalEntryRepository: JournalEntryRepository,
    private accountRepository: AccountRepository
  ) {}

  async execute(dto: RecordJournalEntryDto & { tenantId: string }): Promise<JournalEntryDto> {
    const latestClosedDate = await this.journalEntryRepository.findLatestClosedDate(dto.tenantId);
    if (latestClosedDate && new Date(dto.date) <= latestClosedDate) {
      throw new PeriodClosedError(new Date(dto.date));
    }

    const entry = new JournalEntry(dto.tenantId, dto.description, dto.date);

    for (const lineDto of dto.lines) {
      const account = await this.accountRepository.findById(lineDto.accountId);
      if (!account) {
        throw new AccountNotFoundError(lineDto.accountId);
      }

      if (account.tenantId !== dto.tenantId) {
        throw new CrossTenantAccessError();
      }

      const line = new JournalEntryLine(account, lineDto.debit, lineDto.credit);
      line.description = lineDto.description;
      entry.addLine(line);
    }

    entry.validateBalance();

    const savedEntry = await this.journalEntryRepository.create(entry);
    return JournalEntryMapper.toDto(savedEntry);
  }
}
