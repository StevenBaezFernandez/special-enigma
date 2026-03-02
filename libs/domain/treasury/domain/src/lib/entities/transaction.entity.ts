import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { BankAccount } from './bank-account.entity';
import { TransactionType } from '@virteex/domain-treasury-contracts/enums/transaction-type.enum';

@Entity()
export class Transaction {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
    tenantId!: string;

    date!: Date;

  @Property()
    amount!: number;

  @Enum(() => TransactionType)
  type!: TransactionType;

  @Property()
    description!: string;

    reference?: string;

  @ManyToOne(() => BankAccount)
  bankAccount!: BankAccount;

  @Property()
    createdAt: Date = new Date();

  constructor(tenantId: string, bankAccount: BankAccount, amount: number, type: TransactionType, description: string) {
    this.tenantId = tenantId;
    this.bankAccount = bankAccount;
    this.amount = amount;
    this.type = type;
    this.description = description;
    this.date = new Date();
  }
}
