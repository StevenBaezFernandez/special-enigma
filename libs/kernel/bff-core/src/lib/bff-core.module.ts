import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthModule, CanonicalTenantMiddleware } from '@virteex/kernel-auth';
import { TenantModule } from '@virteex/kernel-tenant';
import { TelemetryModule } from '@virteex/kernel-telemetry';
import { TenantContextMiddleware } from './middleware/tenant-context.middleware';
import { BffAuthGuard } from './guards/bff-auth.guard';
import { ResilientHttpClient } from './client/resilient-http.client';
import { GlobalBffExceptionHandler } from './filters/global-bff-exception.filter';

@Module({
  imports: [AuthModule, TenantModule, TelemetryModule],
  providers: [BffAuthGuard, ResilientHttpClient, GlobalBffExceptionHandler],
  exports: [AuthModule, TenantModule, BffAuthGuard, ResilientHttpClient, GlobalBffExceptionHandler],
})
export class BffCoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CanonicalTenantMiddleware, TenantContextMiddleware)
      .forRoutes('*');
  }
}
