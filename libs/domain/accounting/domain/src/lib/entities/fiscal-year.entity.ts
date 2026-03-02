import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";

export enum FiscalYearStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

@Entity()
export class FiscalYear {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
    tenantId!: string;

    year!: number;

  @Enum(() => FiscalYearStatus)
  @Property()
  status: FiscalYearStatus = FiscalYearStatus.OPEN;

  @Property()
    startDate!: Date;

  @Property()
    endDate!: Date;

  constructor(tenantId: string, year: number, startDate: Date, endDate: Date) {
    this.tenantId = tenantId;
    this.year = year;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}
