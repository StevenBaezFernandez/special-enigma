export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name || 'DomainException';
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string | number) {
    super(`${entityName} with id ${id} not found`);
    this.name = 'EntityNotFoundException';
  }
}

export class UnauthorizedException extends DomainException {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends DomainException {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenException';
  }
}

export class ConflictException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictException';
  }
}

export class BadRequestException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestException';
  }
}
