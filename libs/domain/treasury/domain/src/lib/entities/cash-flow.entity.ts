import { CashFlowType } from '@virteex/shared-contracts';
import type { BankAccount } from './bank-account.entity';

export class CashFlow {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

    tenantId!: string;

    date!: Date;

    amount!: number;

  @Enum(() => CashFlowType)
  type!: CashFlowType;

    description!: string;

    reference?: string;

  @ManyToOne('BankAccount')
  bankAccount!: BankAccount;

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
