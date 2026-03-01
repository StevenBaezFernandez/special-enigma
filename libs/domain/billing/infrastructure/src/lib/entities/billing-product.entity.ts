
export class BillingProductEntity {
  @PrimaryKey({ type: 'string' })
  id!: string;

    tenantId!: string;

    name!: string;

    price!: number;

    taxGroup?: string;

    fiscalCode?: string;

    isActive: boolean = true;
}
