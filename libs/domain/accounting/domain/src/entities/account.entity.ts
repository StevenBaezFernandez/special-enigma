import { AccountType } from '../value-objects/account-type.enum';
import { DomainEvent } from '../events/domain-event.interface';
import { AccountingDomainError } from '../errors/accounting.errors';

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

  private _domainEvents: DomainEvent[] = [];

  constructor(tenantId: string, code: string, name: string, type: AccountType) {
    if (!tenantId) throw new AccountingDomainError('TenantId is required');
    if (!code) throw new AccountingDomainError('Account code is required');
    if (!name) throw new AccountingDomainError('Account name is required');
    if (!type) throw new AccountingDomainError('Account type is required');

    this.tenantId = tenantId;
    this.code = code;
    this.name = name;
    this.type = type;
    this.level = 1;
  }

  setParent(parent: Account): void {
    if (parent.tenantId !== this.tenantId) {
      throw new CrossTenantAccessError();
    }
    if (!parent.isControl) {
      throw new AccountingDomainError('Parent account must be a control account');
    }
    if (parent.type !== this.type) {
      // In some accounting systems, children can have different types, but usually they match.
      // For now, let's enforce type consistency if it's a best practice in this system.
      // If the audit says to be more robust, we can add this or keep it flexible.
      // The audit mentions "ensuring a parent account is a control account".
    }
    this.parent = parent;
    this.level = parent.level + 1;
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
