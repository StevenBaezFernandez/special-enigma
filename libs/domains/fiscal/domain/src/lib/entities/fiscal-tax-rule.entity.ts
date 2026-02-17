import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class FiscalTaxRule {
  @PrimaryKey()
  id: string = uuidv4();

  @Property()
  tenantId!: string; // Allow tenant-specific rules

  @Property()
  name!: string; // e.g., 'IVA 16%', 'ISR Retención'

  @Property()
  type!: string; // e.g., 'IVA', 'ISR', 'IEPS'

  @Property({ type: 'decimal', precision: 10, scale: 4 })
  rate!: string; // e.g., '0.1600'

  @Property({ nullable: true })
  appliesTo?: string; // e.g., 'General', 'Professional Services'

  @Property()
  isActive = true;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(tenantId: string, name: string, type: string, rate: string, appliesTo?: string) {
    this.tenantId = tenantId;
    this.name = name;
    this.type = type;
    this.rate = rate;
    this.appliesTo = appliesTo;
  }
}
