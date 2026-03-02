import { Cascade, Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import type { JournalEntryLine } from './journal-entry-line.entity';
import { JournalEntryStatus } from '@virteex/domain-accounting-contracts';

@Entity()
export class JournalEntry {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
    tenantId!: string;

    date!: Date;

  @Property()
    description!: string;

  @Enum(() => JournalEntryStatus)
  @Property()
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
