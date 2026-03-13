export class BaseException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestException extends BaseException {}
export class EntityNotFoundException extends BaseException {}
export class UnauthorizedException extends BaseException {}
export class ForbiddenException extends BaseException {}
export class ConflictException extends BaseException {}
export class InternalServerErrorException extends BaseException {}
