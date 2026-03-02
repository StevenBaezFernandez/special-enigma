import { Cascade, Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import type { CashFlow } from './cash-flow.entity';

@Entity()
export class BankAccount {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
    tenantId!: string;

  @Property()
    name!: string;

    accountNumber!: string;

    bankName!: string;

  @Property()
    currency!: string;

    balance = 0;

  @OneToMany('CashFlow', 'bankAccount', { cascade: [Cascade.ALL] })
  transactions = new Collection<CashFlow>(this);

  @Property()
    createdAt: Date = new Date();

  @Property()
    updatedAt: Date = new Date();

  constructor(tenantId: string, name: string, accountNumber: string, bankName: string, currency: string) {
    this.tenantId = tenantId;
    this.name = name;
    this.accountNumber = accountNumber;
    this.bankName = bankName;
    this.currency = currency;
  }
}
