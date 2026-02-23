import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TenantContextMiddleware } from './middleware/tenant-context.middleware';
import { TenantGuard } from './guards/tenant.guard';
import { TelemetryModule } from '@virteex/telemetry';
import { SecretManagerService, SECRET_PROVIDER } from './services/secret-manager.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DefaultSecretProvider } from './services/providers/default-secret.provider';

@Module({
  imports: [ConfigModule, TelemetryModule, PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.register({})],
  providers: [
    TenantContextMiddleware,
    TenantGuard,
    SecretManagerService,
    JwtStrategy,
    DefaultSecretProvider,
    {
        provide: SECRET_PROVIDER,
        useClass: DefaultSecretProvider
    }
  ],
  exports: [TenantContextMiddleware, TenantGuard, SecretManagerService, PassportModule, JwtModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
