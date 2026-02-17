export class ProductUpdatedEvent {
  constructor(
    public readonly id: number,
    public readonly tenantId: string,
    public readonly sku: string,
    public readonly name: string,
    public readonly price: string,
    public readonly isActive: boolean,
    public readonly occurredOn: Date,
    public readonly taxGroup?: string,
    public readonly fiscalCode?: string
  ) {}
}
