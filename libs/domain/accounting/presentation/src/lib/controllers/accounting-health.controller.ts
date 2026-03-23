import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, MikroOrmHealthIndicator } from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Accounting Health')
@Controller('health/accounting')
export class AccountingHealthController {
  constructor(
    private health: HealthCheckService,
    private db: MikroOrmHealthIndicator,
  ) {}

  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: 'Accounting service readiness check' })
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Accounting service liveness check' })
  liveness() {
    return { status: 'up' };
  }
}
