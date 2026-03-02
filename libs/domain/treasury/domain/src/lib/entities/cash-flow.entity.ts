import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { CashFlowType } from '@virteex/shared-contracts';
import type { BankAccount } from './bank-account.entity';

@Entity()
export class CashFlow {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
    tenantId!: string;

    date!: Date;

  @Property()
    amount!: number;

  @Enum(() => CashFlowType)
  type!: CashFlowType;

  @Property()
    description!: string;

    reference?: string;

  @ManyToOne('BankAccount')
  bankAccount!: BankAccount;

  @Property()
    createdAt: Date = new Date();

  constructor(tenantId: string, bankAccount: BankAccount, amount: number, type: CashFlowType, description: string) {
    this.tenantId = tenantId;
    this.bankAccount = bankAccount;
    this.amount = amount;
    this.type = type;
    this.description = description;
    this.date = new Date();
  }
}
