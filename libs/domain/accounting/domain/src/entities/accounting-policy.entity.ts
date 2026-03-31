import { DomainEvent } from '../events/domain-event.interface';
import { AccountingDomainError } from '../errors/accounting.errors';

export class AccountingPolicy {
  id!: string;
  tenantId!: string;
  type!: string; // 'invoice', 'payroll', 'closing', 'consolidation'
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
    if (!this.tenantId) throw new AccountingDomainError('Tenant ID is required for policy');
    if (!['invoice', 'payroll', 'closing', 'consolidation'].includes(this.type)) {
      throw new AccountingDomainError(`Invalid policy type: ${this.type}`);
    }
    if (!this.rules || typeof this.rules !== 'object') {
      throw new AccountingDomainError('Rules must be a valid object');
    }

    // Specific validations based on type
    if (this.type === 'invoice') {
       if (!this.rules['salesAccountCode']) throw new AccountingDomainError('Invoice policy requires salesAccountCode');
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
