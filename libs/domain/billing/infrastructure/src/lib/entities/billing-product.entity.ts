import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";

@Entity()
export class BillingProductEntity {
  @PrimaryKey({ type: 'string' })
  id!: string;

  @Property()
    tenantId!: string;

  @Property()
    name!: string;

    price!: number;

    taxGroup?: string;

    fiscalCode?: string;

    isActive: boolean = true;
}
