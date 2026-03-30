import { DomainEvent } from '../events/domain-event.interface';

export class AccountingPolicy {
  id!: string;
  tenantId!: string;
  type!: string; // 'invoice', 'payroll', 'closing'
  rules!: Record<string, unknown>;

  private _domainEvents: DomainEvent[] = [];

  constructor(tenantId: string, type: string, rules: Record<string, unknown>) {
    this.tenantId = tenantId;
    this.type = type;
    this.rules = rules;
    this.validate();
  }

  updateRules(rules: Record<string, unknown>): void {
    this.rules = rules;
    this.validate();
  }

  private validate(): void {
    if (!this.tenantId) throw new Error('Tenant ID is required for policy');
    if (!['invoice', 'payroll', 'closing'].includes(this.type)) {
      throw new Error(`Invalid policy type: ${this.type}`);
    }
    if (!this.rules || typeof this.rules !== 'object') {
      throw new Error('Rules must be a valid object');
    }

    // Specific validations based on type
    if (this.type === 'invoice') {
       if (!this.rules['salesAccountCode']) throw new Error('Invoice policy requires salesAccountCode');
    }
  }

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  recordEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  clearEvents(): void {
    this._domainEvents = [];
  }
}
