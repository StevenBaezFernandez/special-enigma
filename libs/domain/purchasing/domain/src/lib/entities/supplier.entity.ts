import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { SupplierType } from '../enums/supplier-type.enum';

@Entity()
export class Supplier {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
    tenantId!: string;

  @Property()
    name!: string;

    taxId!: string;

  @Enum(() => SupplierType)
  type!: SupplierType;

    email?: string;

    phoneNumber?: string;

    address?: string;

  @Property()
    createdAt: Date = new Date();

  constructor(tenantId: string, name: string, taxId: string, type: SupplierType) {
    this.tenantId = tenantId;
    this.name = name;
    this.taxId = taxId;
    this.type = type;
  }
}
