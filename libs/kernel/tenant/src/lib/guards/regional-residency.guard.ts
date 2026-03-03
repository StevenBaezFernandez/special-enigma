import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { TenantService } from '../tenant.service';
import { getTenantContext } from '@virteex/kernel-auth';
import { TenantControlRecord } from '../entities/tenant-control-record.entity';

@Injectable()
export class RegionalResidencyGuard implements CanActivate {
  private readonly logger = new Logger(RegionalResidencyGuard.name);

  constructor(private readonly tenantService: TenantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tenantContext = getTenantContext();
    if (!tenantContext) {
      this.logger.warn('Async execution attempt without tenant context');
      throw new ForbiddenException('Tenant context is required for all execution channels');
    }

    const tenantId = tenantContext.tenantId;
    const config = await this.tenantService.getTenantConfig(tenantId);

    const currentRegion = process.env['AWS_REGION'] || 'us-east-1';
    const allowedRegion = config.settings?.['allowedRegion'] || config.primaryRegion;

    if (!allowedRegion) {
        this.logger.error(`[ASYNC] No residency policy for tenant ${tenantId}. Access denied.`);
        throw new ForbiddenException('Data residency policy not established.');
    }

    if (allowedRegion !== currentRegion) {
        this.logger.error(`[ASYNC SECURITY] Data Sovereignty Violation: Tenant ${tenantId} is restricted to ${allowedRegion} but async task reached ${currentRegion}`);
        this.logger.warn(`AUDIT: ASYNC Region Bypass Attempted: Tenant=${tenantId}, Expected=${allowedRegion}, Actual=${currentRegion}`);
        throw new ForbiddenException(`Data residency policy violation in async channel. Access denied for region: ${currentRegion}`);
    }

    // 2. Write-Freezing Enforcement for Async Tasks
    // In Virteex, background tasks are often write-heavy. We block if frozen.
    const em = (this.tenantService as any).em; // Accessing internal EM or via dependency

    if (em) {
        const control = await em.findOne(TenantControlRecord, { tenantId }, { filters: false });
        if (control?.isFrozen) {
            this.logger.error(`[ASYNC SECURITY] Async task blocked for frozen tenant ${tenantId}`);
            throw new ForbiddenException(`Tenant is currently frozen. Async writes/processing are disabled.`);
        }
    }

    return true;
  }
}
