import { DomainEvent } from './domain-event.interface';

export class AccountCreated implements DomainEvent {
  readonly occurredAt: string;
  readonly eventName: string = 'AccountCreated';

  constructor(
    readonly aggregateId: string,
    readonly tenantId: string,
    readonly code: string,
    readonly name: string
  ) {
    this.occurredAt = new Date().toISOString();
  }
}
