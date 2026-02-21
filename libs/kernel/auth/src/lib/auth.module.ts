import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenantContextMiddleware } from './middleware/tenant-context.middleware';
import { TenantGuard } from './guards/tenant.guard';
import { TelemetryModule } from '@virteex/telemetry';
import { SecretManagerService } from './services/secret-manager.service';

@Module({
  imports: [ConfigModule, TelemetryModule],
  providers: [TenantContextMiddleware, TenantGuard, SecretManagerService],
  exports: [TenantContextMiddleware, TenantGuard, SecretManagerService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
