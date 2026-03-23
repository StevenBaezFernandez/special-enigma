export class AccountingPolicy {
  id!: string;
  tenantId!: string;
  type!: string; // 'invoice', 'payroll', 'closing'
  rules!: Record<string, any>;

  constructor(tenantId: string, type: string, rules: Record<string, any>) {
    this.tenantId = tenantId;
    this.type = type;
    this.rules = rules;
  }
}
