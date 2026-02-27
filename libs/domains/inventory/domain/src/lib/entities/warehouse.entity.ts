import { v4 } from 'uuid';
import { DomainValidationError } from '../errors/domain-validation.error';

export class Warehouse {
  readonly id: string;
  readonly tenantId: string;
  readonly createdAt: Date;
  private _code: string;
  private _name: string;
  private _address?: string;
  private _description?: string;
  private _isActive = true;
  private _updatedAt: Date;

  constructor(tenantId: string, code: string, name: string, id?: string) {
    this.id = id || v4();
    this.tenantId = tenantId;
    this.assertNonEmpty(code, 'Warehouse code is required');
    this.assertNonEmpty(name, 'Warehouse name is required');
    this._code = code;
    this._name = name;
    this.createdAt = new Date();
    this._updatedAt = new Date();
  }

  get code(): string { return this._code; }
  get name(): string { return this._name; }
  get address(): string | undefined { return this._address; }
  get description(): string | undefined { return this._description; }
  get isActive(): boolean { return this._isActive; }
  get updatedAt(): Date { return this._updatedAt; }

  rename(name: string): void {
    this.assertNonEmpty(name, 'Warehouse name is required');
    this._name = name;
    this.touch();
  }

  recode(code: string): void {
    this.assertNonEmpty(code, 'Warehouse code is required');
    this._code = code;
    this.touch();
  }

  changeAddress(address?: string): void {
    this._address = address;
    this.touch();
  }

  changeDescription(description?: string): void {
    this._description = description;
    this.touch();
  }

  activate(): void {
    this._isActive = true;
    this.touch();
  }

  deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  hydrateTimestamps(createdAt: Date, updatedAt: Date): void {
    (this as { createdAt: Date }).createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  private assertNonEmpty(value: string, message: string): void {
    if (!value || value.trim().length === 0) {
      throw new DomainValidationError(message);
    }
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}
