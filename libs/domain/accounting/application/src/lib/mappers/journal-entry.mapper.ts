import { JournalEntry } from '@virteex/domain-accounting-domain';
import { JournalEntryDto, JournalEntryLineDto } from '@virteex/domain-accounting-contracts';

export class JournalEntryMapper {
  static toDto(entity: JournalEntry): JournalEntryDto {
    const lines: JournalEntryLineDto[] = entity.lines.getItems().map(line => ({
      id: line.id,
      accountId: line.account.id,
      debit: line.debit,
      credit: line.credit,
      description: line.description
    }));

    return {
      id: entity.id,
      tenantId: entity.tenantId,
      date: entity.date,
      description: entity.description,
      status: entity.status,
      lines: lines
    };
  }
}
