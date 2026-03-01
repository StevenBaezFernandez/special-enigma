import { BankAccount } from './bank-account.entity';
import { TransactionType } from '@virteex/domain-treasury-contracts/enums/transaction-type.enum';

export class Transaction {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

    tenantId!: string;

    date!: Date;

    amount!: number;

  @Enum(() => TransactionType)
  type!: TransactionType;

    description!: string;

    reference?: string;

  @ManyToOne(() => BankAccount)
  bankAccount!: BankAccount;

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
