import { Module, Global } from '@nestjs/common';
import { TelemetryService } from './telemetry';
import { PersistenceMetricsService } from './persistence-metrics.service';

@Global()
@Module({
  providers: [TelemetryService, PersistenceMetricsService],
  exports: [TelemetryService, PersistenceMetricsService],
})
export class TelemetryModule {}
