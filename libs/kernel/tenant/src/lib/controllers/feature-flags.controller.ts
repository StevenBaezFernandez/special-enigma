import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, TenantGuard, CurrentTenant } from '@virteex/kernel-auth';
import { EntitlementService } from '@virteex/kernel-entitlements';

@ApiTags('Tenant')
@Controller('tenant/feature-flags')
@UseGuards(JwtAuthGuard, TenantGuard)
export class FeatureFlagsController {
  constructor(private readonly entitlementService: EntitlementService) {}

  @Get()
  @ApiOperation({ summary: 'Get feature flags for the current tenant' })
  async getFeatureFlags(@CurrentTenant() tenantId: string) {
    // This is a simplified implementation that uses entitlements as feature flags
    // In a more complex system, this might fetch from a dedicated feature flag service
    const features = ['invoices', 'users', 'storage', 'branches', 'advanced-reports', 'treasury', 'payroll'];
    const results = await Promise.all(
        features.map(f => this.entitlementService.isFeatureEnabled(f))
    );

    const flags: Record<string, boolean> = {};
    features.forEach((f, i) => {
        flags[f] = results[i];
    });

    return flags;
  }
}
