import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { v4 as uuidv4 } from 'uuid';

export class TaxRule {
    id: string = uuidv4();

    jurisdiction!: string; // e.g., 'MX', 'BR'

    taxType!: string; // e.g., 'IVA', 'ISR'

    rate!: string; // e.g., '0.1600'

    validFrom!: Date;

    validTo?: Date;

    condition?: string; // e.g. JSON string for complex rules or 'ALL'

  constructor(jurisdiction: string, taxType: string, rate: string, validFrom: Date) {
    this.jurisdiction = jurisdiction;
    this.taxType = taxType;
    this.rate = rate;
    this.validFrom = validFrom;
  }
}
