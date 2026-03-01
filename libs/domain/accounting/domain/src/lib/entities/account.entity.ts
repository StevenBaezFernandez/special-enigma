import { AccountType } from '@virteex/contracts-accounting-contracts';

export class Account {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

    tenantId!: string;

    code!: string;

    name!: string;

  @Enum(() => AccountType)
  type!: AccountType;

  @ManyToOne(() => Account, { nullable: true })
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
