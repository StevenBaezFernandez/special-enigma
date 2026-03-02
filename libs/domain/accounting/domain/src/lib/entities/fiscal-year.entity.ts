export enum FiscalYearStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export class FiscalYear {
  id!: string;
  tenantId!: string;
  year!: number;
  status: FiscalYearStatus = FiscalYearStatus.OPEN;
  startDate!: Date;
  endDate!: Date;

  constructor(tenantId: string, year: number, startDate: Date, endDate: Date) {
    this.tenantId = tenantId;
    this.year = year;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}
