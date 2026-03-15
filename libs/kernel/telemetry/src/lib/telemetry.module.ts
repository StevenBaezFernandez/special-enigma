import { Module, Global } from '@nestjs/common';
import { TELEMETRY_SERVICE, TelemetryService as AbstractTelemetryService } from '@virteex/kernel-telemetry-interfaces';
import { TelemetryService } from './telemetry';
import { PersistenceMetricsService } from './persistence-metrics.service';

@Global()
@Module({
  providers: [
    {
      provide: TELEMETRY_SERVICE,
      useClass: TelemetryService,
    },
    {
      provide: AbstractTelemetryService,
      useClass: TelemetryService,
    },
    TelemetryService,
    PersistenceMetricsService,
  ],
  exports: [TELEMETRY_SERVICE, AbstractTelemetryService, TelemetryService, PersistenceMetricsService],
})
export class TelemetryModule {}
