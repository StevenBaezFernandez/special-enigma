export class AccountingDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}


export class AccountAlreadyExistsError extends AccountingDomainError {
  constructor(code: string) {
    super(`Account with code ${code} already exists`);
  }
}

export class AccountNotFoundError extends AccountingDomainError {
  constructor(accountId: string) {
    super(`Account ${accountId} not found`);
  }
}

export class ParentAccountNotFoundError extends AccountingDomainError {
  constructor(parentId: string) {
    super(`Parent account ${parentId} not found`);
  }
}

export class CrossTenantAccessError extends AccountingDomainError {
  constructor() {
    super(`Access to a different tenant's resources is not allowed`);
  }
}

export class JournalEntryNotBalancedError extends AccountingDomainError {
  constructor(debit: string, credit: string) {
    super(`Journal Entry is not balanced. Debit: ${debit}, Credit: ${credit}`);
  }
}

export class NegativeAmountError extends AccountingDomainError {
  constructor() {
    super('Debit and Credit amounts must be non-negative');
  }
}

export class PeriodClosedError extends AccountingDomainError {
  constructor(date: Date) {
    super(`The period for date ${date.toISOString()} is already closed`);
  }
}

export class InvalidDimensionKeyError extends AccountingDomainError {
  constructor(key: string) {
    super(`Invalid dimension key: ${key}`);
  }
}
