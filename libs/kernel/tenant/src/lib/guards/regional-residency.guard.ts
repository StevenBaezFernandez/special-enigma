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
      this.logger.error('[ASYNC SECURITY] Execution attempt without tenant context. Blocking.');
      throw new ForbiddenException('Tenant context is required for all execution channels');
    }

    const tenantId = tenantContext.tenantId;
    const config = await this.tenantService.getTenantConfig(tenantId);

    const currentRegion = process.env['AWS_REGION'];
    const isProduction = process.env['NODE_ENV'] === 'production';

    if (isProduction && !currentRegion) {
        this.logger.error('[SECURITY CRITICAL] AWS_REGION missing in production for async task');
        throw new Error('Regional context missing');
    }

    const effectiveCurrentRegion = currentRegion || 'us-east-1';
    const allowedRegion = config.settings?.['allowedRegion'] || config.primaryRegion;

    if (!allowedRegion) {
        this.logger.error(`[ASYNC SECURITY] No residency policy for tenant ${tenantId}. Fail-closed.`);
        throw new ForbiddenException('Data residency policy not established.');
    }

    if (allowedRegion !== effectiveCurrentRegion) {
        this.logger.error(`[ASYNC SECURITY] Data Sovereignty Violation: Tenant ${tenantId} is restricted to ${allowedRegion} but async task reached ${effectiveCurrentRegion}`);
        this.logger.warn(`AUDIT: ASYNC Region Bypass Attempted: Tenant=${tenantId}, Expected=${allowedRegion}, Actual=${effectiveCurrentRegion}`);
        throw new ForbiddenException(`Data residency policy violation in async channel. Access denied for region: ${effectiveCurrentRegion}`);
    }

    // 2. Write-Freezing and Status Enforcement for Async Tasks
    const em = (this.tenantService as any).em;

    if (em) {
        const control = await em.findOne(TenantControlRecord, { tenantId }, { filters: false });

        if (!control) {
            this.logger.error(`[ASYNC SECURITY] Control record missing for tenant ${tenantId}`);
            throw new ForbiddenException('Tenant control configuration missing');
        }

        if (control.status !== 'ACTIVE' && control.status !== 'DEGRADED') {
            this.logger.error(`[ASYNC SECURITY] Async task blocked for tenant ${tenantId} in status ${control.status}`);
            throw new ForbiddenException(`Tenant is ${control.status.toLowerCase()}. Async processing disabled.`);
        }

        if (control.isFrozen) {
            this.logger.error(`[ASYNC SECURITY] Async task blocked for frozen tenant ${tenantId}`);
            throw new ForbiddenException(`Tenant is currently frozen. Async writes/processing are disabled.`);
        }
    }

    return true;
  }
}
