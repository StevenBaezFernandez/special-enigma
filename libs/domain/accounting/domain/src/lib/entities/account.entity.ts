import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { AccountType } from '@virteex/domain-accounting-contracts';

@Entity()
export class Account {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
    tenantId!: string;

  @Property()
    code!: string;

  @Property()
    name!: string;

  @Enum(() => AccountType)
  type!: AccountType;

  @ManyToOne(() => Account, { nullable: true })
  parent?: Account;

  @Property()
    level!: number;

    isControl = false;

  @Property()
    currency?: string;

  constructor(tenantId: string, code: string, name: string, type: AccountType) {
    this.tenantId = tenantId;
    this.code = code;
    this.name = name;
    this.type = type;
    this.level = 1;
  }
}
