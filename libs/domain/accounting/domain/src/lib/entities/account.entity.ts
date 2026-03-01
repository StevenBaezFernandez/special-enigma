import { AccountType } from '@virteex/contracts-accounting-contracts';

export class Account {
  id!: string;
  tenantId!: string;
  code!: string;
  name!: string;
  type!: AccountType;
  parent?: Account;
  level!: number;
  isControl = false;
  currency?: string;

  constructor(tenantId: string, code: string, name: string, type: AccountType) {
    this.tenantId = tenantId;
    this.code = code;
    this.name = name;
    this.type = type;
    this.level = 1;
  }
}
