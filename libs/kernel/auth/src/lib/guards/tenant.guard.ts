import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext } from '@virteex/kernel-tenant-context';
import '../interfaces/express.interface';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantContext: TenantContext = request.tenantContext;

    if (!tenantContext) {
      throw new UnauthorizedException('Missing Tenant Context');
    }

    // Additional validation could happen here (e.g. check if tenant is active)
    return true;
  }
}
