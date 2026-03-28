export class AccountingPolicy {
  id!: string;
  tenantId!: string;
  type!: string; // 'invoice', 'payroll', 'closing'
  rules!: Record<string, unknown>;

  constructor(tenantId: string, type: string, rules: Record<string, unknown>) {
    this.tenantId = tenantId;
    this.type = type;
    this.rules = rules;
  }
}
