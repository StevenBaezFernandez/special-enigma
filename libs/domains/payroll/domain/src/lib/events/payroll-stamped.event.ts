export class PayrollStampedEvent {
  constructor(
    public readonly payrollId: string,
    public readonly tenantId: string,
    public readonly netPay: number,
    public readonly taxes: number,
    public readonly date: Date
  ) {}
}
