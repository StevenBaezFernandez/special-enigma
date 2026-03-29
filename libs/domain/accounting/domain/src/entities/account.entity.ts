import { AccountType } from '../value-objects/account-type.enum';
import { DomainEvent } from '../events/domain-event.interface';

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
    if (!tenantId) throw new Error('TenantId is required');
    if (!code) throw new Error('Account code is required');
    if (!name) throw new Error('Account name is required');
    if (!type) throw new Error('Account type is required');

    this.tenantId = tenantId;
    this.code = code;
    this.name = name;
    this.type = type;
    this.level = 1;
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
