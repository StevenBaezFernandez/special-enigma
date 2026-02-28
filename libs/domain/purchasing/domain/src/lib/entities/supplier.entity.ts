import { Entity, PrimaryKey, Property, Enum, Unique } from '@mikro-orm/core';
import { SupplierType } from '../enums/supplier-type.enum';

@Entity()
@Unique({ properties: ['tenantId', 'taxId'] })
export class Supplier {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  name!: string;

  @Property()
  taxId!: string;

  @Enum(() => SupplierType)
  type!: SupplierType;

  @Property({ nullable: true })
  email?: string;

  @Property({ nullable: true })
  phoneNumber?: string;

  @Property({ nullable: true })
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
