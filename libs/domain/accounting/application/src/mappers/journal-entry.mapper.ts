import { JournalEntry } from '@virteex/domain-accounting-domain';
import {
  type JournalEntryDto,
  JournalEntryLineDto,
  JournalEntryStatus as JournalEntryStatusDto,
  JournalEntryType as JournalEntryTypeDto,
  JournalEntryDtoV2
} from '@virteex/domain-accounting-contracts';
import { Decimal } from 'decimal.js';

export class JournalEntryMapper {
  static toDto(entity: JournalEntry): JournalEntryDto {
    let totalAmount = new Decimal(0);
    const lines: JournalEntryLineDto[] = entity.lines.map(line => {
      totalAmount = totalAmount.plus(new Decimal(line.debit));
      return {
      id: line.id,
      accountId: line.account.id,
      debit: line.debit,
      credit: line.credit,
      description: line.description
    }});

    return {
      id: entity.id,
      tenantId: entity.tenantId,
      date: entity.date,
      description: entity.description,
      status: entity.status as unknown as JournalEntryStatusDto,
      type: entity.type as unknown as JournalEntryTypeDto,
      reference: entity.reference,
      amount: totalAmount.toNumber(),
      lines: lines
    };
  }

  static toDtoV2(entity: JournalEntry): JournalEntryDtoV2 {
    let totalDebit = new Decimal(0);
    let totalCredit = new Decimal(0);

    const lines: JournalEntryLineDto[] = entity.lines.map(line => {
      totalDebit = totalDebit.plus(new Decimal(line.debit));
      totalCredit = totalCredit.plus(new Decimal(line.credit));
      return {
        id: line.id,
        accountId: line.account.id,
        debit: line.debit,
        credit: line.credit,
        description: line.description
      };
    });

    return {
      id: entity.id,
      tenantId: entity.tenantId,
      date: entity.date,
      description: entity.description,
      status: entity.status as unknown as JournalEntryStatusDto,
      type: entity.type as unknown as JournalEntryTypeDto,
      reference: entity.reference,
      totalDebit: totalDebit.toNumber(),
      totalCredit: totalCredit.toNumber(),
      lines: lines
    };
  }
}
