import { Entity, PrimaryKey, Property, Enum, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { CustomerType } from '@virteex/contracts';
import { Opportunity } from './opportunity.entity';

@Entity()
export class Customer {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  tenantId!: string;

  @Enum(() => CustomerType)
  type: CustomerType = CustomerType.COMPANY;

  @Property({ nullable: true })
  firstName?: string;

  @Property({ nullable: true })
  lastName?: string;

  @Property({ nullable: true })
  companyName?: string;

  @Property({ nullable: true })
  email?: string;

  @Property({ nullable: true })
  phone?: string;

  @Property({ nullable: true })
  taxId?: string;

  @Property({ nullable: true })
  taxRegimen?: string;

  @Property({ nullable: true })
  contactPerson?: string;

  @Property({ nullable: true })
  address?: string;

  @Property({ nullable: true })
  city?: string;

  @Property({ nullable: true })
  stateOrProvince?: string;

  @Property({ nullable: true })
  postalCode?: string;

  @Property({ nullable: true })
  country?: string;

  @OneToMany('Opportunity', 'customer', { cascade: [Cascade.ALL] })
  opportunities = new Collection<Opportunity>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(tenantId: string, type: CustomerType) {
    this.tenantId = tenantId;
    this.type = type;
  }
}
