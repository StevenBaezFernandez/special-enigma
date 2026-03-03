import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ABAC_KEY, AbacPolicy } from './abac.decorator';

@Injectable()
export class AbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const policy = this.reflector.getAllAndOverride<AbacPolicy>(ABAC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!policy) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
        throw new ForbiddenException('ABAC requires authenticated user');
    }

    // Example attribute resolution from request body/params
    const objectValue = request.body[policy.objectAttr] || request.params[policy.objectAttr];
    const subjectValue = user[policy.subjectAttr];

    if (!policy.matcher(subjectValue, objectValue)) {
       throw new ForbiddenException(`ABAC policy violation: User ${policy.subjectAttr} does not match Object ${policy.objectAttr}`);
    }

    return true;
  }
}
