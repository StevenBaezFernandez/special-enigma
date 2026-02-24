import { Entity, PrimaryKey, Property, Enum, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import type { JournalEntryLine } from './journal-entry-line.entity';
import { JournalEntryStatus } from '@virteex/contracts-accounting-contracts';

@Entity()
export class JournalEntry {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  date!: Date;

  @Property()
  description!: string;

  @Enum(() => JournalEntryStatus)
  status: JournalEntryStatus = JournalEntryStatus.DRAFT;

  @OneToMany('JournalEntryLine', 'journalEntry', { cascade: [Cascade.ALL] })
  lines = new Collection<JournalEntryLine>(this);

  constructor(tenantId: string, description: string, date: Date) {
    this.tenantId = tenantId;
    this.description = description;
    this.date = date;
  }

  addLine(line: JournalEntryLine) {
    this.lines.add(line);
    line.journalEntry = this;
  }
}
