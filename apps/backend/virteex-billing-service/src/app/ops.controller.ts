import { Controller, Get } from '@nestjs/common';
import { OpsReadinessService } from './ops-readiness.service';

@Controller('ops')
export class OpsController {
  constructor(private readonly readiness: OpsReadinessService) {}

  @Get('health')
  health() {
    return { status: 'up', service: 'virteex-billing-service', timestamp: new Date().toISOString() };
  }

  @Get('readiness')
  async readinessCheck() {
    return this.readiness.checkAll();
  }
}
