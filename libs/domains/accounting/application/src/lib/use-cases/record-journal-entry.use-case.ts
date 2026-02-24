import { Inject, Injectable } from '@nestjs/common';
import {
  JournalEntry,
  JournalEntryLine,
  JOURNAL_ENTRY_REPOSITORY,
  JournalEntryRepository,
  ACCOUNT_REPOSITORY,
  AccountRepository
} from '@virteex/domain-accounting-domain';
import { RecordJournalEntryDto, JournalEntryDto } from '@virteex/contracts-accounting-contracts';
import { JournalEntryMapper } from '../mappers/journal-entry.mapper';
import { Decimal } from 'decimal.js';

@Injectable()
export class RecordJournalEntryUseCase {
  constructor(
    @Inject(JOURNAL_ENTRY_REPOSITORY) private journalEntryRepository: JournalEntryRepository,
    @Inject(ACCOUNT_REPOSITORY) private accountRepository: AccountRepository
  ) {}

  async execute(dto: RecordJournalEntryDto): Promise<JournalEntryDto> {
    const entry = new JournalEntry(dto.tenantId, dto.description, dto.date);

    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    for (const lineDto of dto.lines) {
      const account = await this.accountRepository.findById(lineDto.accountId);
      if (!account) {
        throw new Error(`Account ${lineDto.accountId} not found`);
      }

      if (account.tenantId !== dto.tenantId) {
        throw new Error(`Account ${lineDto.accountId} belongs to a different tenant`);
      }

      const debit = new Decimal(lineDto.debit);
      const credit = new Decimal(lineDto.credit);

      if (debit.isNegative() || credit.isNegative()) {
         throw new Error('Debit and Credit amounts must be non-negative');
      }

      const line = new JournalEntryLine(account, debit.toFixed(2), credit.toFixed(2));
      line.description = lineDto.description;
      entry.addLine(line);

      totalDebit = totalDebit.plus(debit);
      totalCredit = totalCredit.plus(credit);
    }

    // Validation: Double entry
    if (!totalDebit.equals(totalCredit)) {
       throw new Error(`Journal Entry is not balanced. Debit: ${totalDebit.toFixed(2)}, Credit: ${totalCredit.toFixed(2)}`);
    }

    const savedEntry = await this.journalEntryRepository.create(entry);
    return JournalEntryMapper.toDto(savedEntry);
  }
}
