import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { STEP_UP_KEY, StepUpOptions } from '../decorators/step-up.decorator';
import { TelemetryService } from '@virteex/kernel-telemetry';

@Injectable()
export class StepUpGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly telemetry: TelemetryService) {}

  canActivate(context: ExecutionContext): boolean {
    const config = this.reflector.getAllAndOverride<StepUpOptions>(STEP_UP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!config) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Step-up requires authenticated user');
    }

    const amr = Array.isArray(user.amr) ? user.amr : [];
    const verifiedAt = Number(user.mfa_verified_at || 0);
    const now = Math.floor(Date.now() / 1000);
    const maxAge = config.maxAgeSeconds ?? 300;

    const hasMfa = amr.includes('mfa') && verifiedAt > 0 && now - verifiedAt <= maxAge;
    if (!hasMfa) {
      this.telemetry.recordSecurityEvent('STEP_UP_REQUIRED', {
        action: config.action,
        requestId: request.headers['x-request-id'],
        userId: user.sub,
        tenantId: user.tenantId,
      });
      throw new ForbiddenException(`Step-up authentication required for ${config.action}`);
    }

    this.telemetry.recordSecurityEvent('STEP_UP_GRANTED', {
      action: config.action,
      requestId: request.headers['x-request-id'],
      userId: user.sub,
      tenantId: user.tenantId,
    });

    return true;
  }
}
