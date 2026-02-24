import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { getTenantContext } from '@virteex/kernel-auth';

@Injectable()
export class TenantThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(req: Record<string, any>): Promise<string> {
    const tenantContext = getTenantContext();
    if (tenantContext && tenantContext.tenantId) {
      return tenantContext.tenantId;
    }
    // Fallback to IP if no tenant context
    return req['ips']?.length ? req['ips'][0] : req['ip'];
  }
}
