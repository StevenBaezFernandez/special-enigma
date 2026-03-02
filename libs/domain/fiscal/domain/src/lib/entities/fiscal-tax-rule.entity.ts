import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { v4 as uuidv4 } from 'uuid';

export class FiscalTaxRule {
    id: string = uuidv4();

  @Property()
    tenantId!: string; // Allow tenant-specific rules

  @Property()
    name!: string; // e.g., 'IVA 16%', 'ISR Retención'

    type!: string; // e.g., 'IVA', 'ISR', 'IEPS'

    rate!: string; // e.g., '0.1600'

    appliesTo?: string; // e.g., 'General', 'Professional Services'

    isActive = true;

  @Property()
    createdAt: Date = new Date();

  @Property()
    updatedAt: Date = new Date();

  constructor(tenantId: string, name: string, type: string, rate: string, appliesTo?: string) {
    this.tenantId = tenantId;
    this.name = name;
    this.type = type;
    this.rate = rate;
    this.appliesTo = appliesTo;
  }
}
