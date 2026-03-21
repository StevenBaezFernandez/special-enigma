import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '@virteex/kernel-auth';

@Injectable()
export class BffAuthGuard extends JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const baseAuth = await super.canActivate(context);
    if (!baseAuth) {
      throw new UnauthorizedException('BFF Authentication failed');
    }

    const request = context.switchToHttp().getRequest();
    // Additional BFF-level authorization checks could go here
    // e.g. checking if the user has access to this specific canal/BFF

    return true;
  }
}
