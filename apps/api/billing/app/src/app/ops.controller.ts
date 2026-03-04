import { Controller, Get } from '@nestjs/common';
import { PreconditionFailedException } from '@nestjs/common';
import { OpsReadinessService } from './ops-readiness.service';
import { FinopsCostService } from './finops-cost.service';

@Controller('ops')
export class OpsController {
  constructor(
    private readonly readiness: OpsReadinessService,
    private readonly finopsCostService: FinopsCostService,
  ) {}

  @Get('health')
  health() {
    return { status: 'up', service: 'virteex-billing-service', timestamp: new Date().toISOString() };
  }

  @Get('readiness')
  async readinessCheck() {
    return this.readiness.checkAll();
  }

  @Get('finops/summary')
  async finopsSummary() {
    return this.finopsCostService.buildOpsSummary();
  }

  @Get('commercial-claims/optimization')
  async optimizationClaimGate() {
    const summary = await this.finopsCostService.buildOpsSummary();
    if (!summary.commercialClaimEligibility.eligible) {
      throw new PreconditionFailedException({
        claim: 'optimization',
        status: 'blocked',
        reason: summary.commercialClaimEligibility.reason,
      });
    }

    return {
      claim: 'optimization',
      status: 'approved',
      reason: summary.commercialClaimEligibility.reason,
    };
  }
}
