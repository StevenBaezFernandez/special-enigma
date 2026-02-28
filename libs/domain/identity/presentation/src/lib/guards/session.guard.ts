import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@virteex/kernel-auth';
import { CachePort } from '@virteex/domain-identity-domain';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(CachePort) private cachePort: CachePort
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sessionId) {
        // Should have been set by JwtAuthGuard if strictly ordered, or token lacks session
        // If token lacks session, maybe old token? Fail.
        throw new UnauthorizedException('Invalid Session');
    }

    const isValid = await this.cachePort.get(`session:${user.sessionId}`);
    if (!isValid) {
        throw new UnauthorizedException('Session Revoked or Expired');
    }

    return true;
  }
}
