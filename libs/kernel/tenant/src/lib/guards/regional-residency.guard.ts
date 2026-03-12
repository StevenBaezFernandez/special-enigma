import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { TenantService } from '../tenant.service';
import { getTenantContext } from '@virteex/kernel-tenant-context';
import { TenantControlRecord } from '../entities/tenant-control-record.entity';
import { ResidencyComplianceService } from '../residency-compliance.service';

@Injectable()
export class RegionalResidencyGuard implements CanActivate {
  private readonly logger = new Logger(RegionalResidencyGuard.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly residencyComplianceService: ResidencyComplianceService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tenantContext = getTenantContext();
    if (!tenantContext) {
      this.logger.error('[ASYNC SECURITY] Execution attempt without tenant context. Blocking.');
      throw new ForbiddenException('Tenant context is required for all execution channels');
    }

    const tenantId = tenantContext.tenantId;
    await this.tenantService.getTenantConfig(tenantId);

    const currentRegion = process.env['AWS_REGION'];
    const isProduction = process.env['NODE_ENV'] === 'production';

    if (isProduction && !currentRegion) {
        this.logger.error('[SECURITY CRITICAL] AWS_REGION missing in production for async task');
        throw new Error('Regional context missing');
    }

    const effectiveCurrentRegion = currentRegion || 'us-east-1';
    await this.residencyComplianceService.assertRegionAllowed(tenantId, effectiveCurrentRegion, 'queue', 'async');

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
