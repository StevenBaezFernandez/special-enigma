import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class TaxRule {
  @PrimaryKey()
  id: string = uuidv4();

  @Property()
  jurisdiction!: string; // e.g., 'MX', 'BR'

  @Property()
  taxType!: string; // e.g., 'IVA', 'ISR'

  @Property({ type: 'decimal', precision: 5, scale: 4 })
  rate!: string; // e.g., '0.1600'

  @Property()
  validFrom!: Date;

  @Property({ nullable: true })
  validTo?: Date;

  @Property({ nullable: true })
  condition?: string; // e.g. JSON string for complex rules or 'ALL'

  constructor(jurisdiction: string, taxType: string, rate: string, validFrom: Date) {
    this.jurisdiction = jurisdiction;
    this.taxType = taxType;
    this.rate = rate;
    this.validFrom = validFrom;
  }
}
