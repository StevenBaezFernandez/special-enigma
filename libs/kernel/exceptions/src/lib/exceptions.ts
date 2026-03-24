export class BaseException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestException extends BaseException {}
export class DomainException extends BaseException {
  constructor(message: string, public readonly code?: string) {
    super(message);
  }
}
export class EntityNotFoundException extends BaseException {
  constructor(entityName: string, entityId: string) {
    super(`${entityName} with ID ${entityId} not found`);
  }
}
export class UnauthorizedException extends BaseException {}
export class ForbiddenException extends BaseException {}
export class ConflictException extends BaseException {}
export class InternalServerErrorException extends BaseException {}
export class CriticalConfigurationException extends BaseException {}
