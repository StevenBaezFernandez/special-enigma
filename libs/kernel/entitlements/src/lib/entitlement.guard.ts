import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntitlementService } from './entitlement.service';
import { ENTITLEMENT_KEY } from './require-entitlement.decorator';

@Injectable()
export class EntitlementGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private entitlementService: EntitlementService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string>(ENTITLEMENT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredFeature) {
      return true;
    }

    const isEnabled = await this.entitlementService.isFeatureEnabled(requiredFeature);
    if (!isEnabled) {
      throw new ForbiddenException(`Access to capability '${requiredFeature}' requires an upgraded plan.`);
    }

    return true;
  }
}
