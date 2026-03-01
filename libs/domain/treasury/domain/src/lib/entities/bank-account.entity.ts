import type { CashFlow } from './cash-flow.entity';

export class BankAccount {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

    tenantId!: string;

    name!: string;

    accountNumber!: string;

    bankName!: string;

    currency!: string;

    balance = 0;

  @OneToMany('CashFlow', 'bankAccount', { cascade: [Cascade.ALL] })
  transactions = new Collection<CashFlow>(this);

    createdAt: Date = new Date();

    updatedAt: Date = new Date();

  constructor(tenantId: string, name: string, accountNumber: string, bankName: string, currency: string) {
    this.tenantId = tenantId;
    this.name = name;
    this.accountNumber = accountNumber;
    this.bankName = bankName;
    this.currency = currency;
  }
}
