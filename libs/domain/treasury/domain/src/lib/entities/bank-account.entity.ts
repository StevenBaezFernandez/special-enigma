
import type { CashFlow } from './cash-flow.entity';


export class BankAccount {

  id!: string;


    tenantId!: string;


    name!: string;

    accountNumber!: string;

    bankName!: string;


    currency!: string;

    balance = 0;


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
