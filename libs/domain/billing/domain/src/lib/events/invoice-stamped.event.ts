export class InvoiceStampedEvent {
  constructor(
    public readonly invoiceId: string,
    public readonly tenantId: string,
    public readonly total: number,
    public readonly taxes: number,
    public readonly date: Date
  ) {}
}
