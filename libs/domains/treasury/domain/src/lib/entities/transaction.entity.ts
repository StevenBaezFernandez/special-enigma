import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { BankAccount } from './bank-account.entity';
import { TransactionType } from '../../../../contracts/src/lib/enums/transaction-type.enum';

@Entity()
export class Transaction {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  date!: Date;

  @Property({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Enum(() => TransactionType)
  type!: TransactionType;

  @Property()
  description!: string;

  @Property({ nullable: true })
  reference?: string;

  @ManyToOne(() => BankAccount)
  bankAccount!: BankAccount;

  @Property({ onCreate: () => new Date() })
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
