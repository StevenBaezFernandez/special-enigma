import { DomainEvent } from '../events/domain-event.interface';

export enum FiscalPeriodStatus {
  OPEN = 'OPEN',
  CLOSING = 'CLOSING',
  CLOSED = 'CLOSED'
}

export class FiscalPeriod {
  id!: string;
  tenantId!: string;
  fiscalYearId!: string;
  periodNumber!: number; // 1-12 for months
  startDate!: Date;
  endDate!: Date;
  status: FiscalPeriodStatus = FiscalPeriodStatus.OPEN;
  closedAt?: Date;
  closedBy?: string;

  private _domainEvents: DomainEvent[] = [];

  constructor(tenantId: string, fiscalYearId: string, periodNumber: number, startDate: Date, endDate: Date) {
    this.tenantId = tenantId;
    this.fiscalYearId = fiscalYearId;
    this.periodNumber = periodNumber;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  recordEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  clearEvents(): void {
    this._domainEvents = [];
  }

  close(userId: string): void {
    this.status = FiscalPeriodStatus.CLOSED;
    this.closedAt = new Date();
    this.closedBy = userId;
  }

  reopen(): void {
    this.status = FiscalPeriodStatus.OPEN;
    this.closedAt = undefined;
    this.closedBy = undefined;
  }

  startClosing(): void {
    this.status = FiscalPeriodStatus.CLOSING;
  }
}
