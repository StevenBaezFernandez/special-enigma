import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TenantContextMiddleware } from './middleware/tenant-context.middleware';
import { TenantGuard } from './guards/tenant.guard';
import { TelemetryModule } from '@virteex/kernel-telemetry';
import { SecretManagerService, SECRET_PROVIDER } from './services/secret-manager.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DefaultSecretProvider } from './services/providers/default-secret.provider';
import { VaultSecretProvider } from './services/providers/vault-secret.provider';
import { KmsSecretProvider } from './services/providers/kms-secret.provider';
import { CompositeSecretProvider } from './services/providers/composite-secret.provider';
import { CsrfMiddleware } from './middleware/csrf.middleware';
import { JwtTokenService } from './services/jwt-token.service';
import { StepUpGuard } from './guards/step-up.guard';

@Module({
  imports: [ConfigModule, TelemetryModule, PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.register({})],
  providers: [
    TenantContextMiddleware,
    TenantGuard,
    SecretManagerService,
    JwtStrategy,
    DefaultSecretProvider,
    VaultSecretProvider,
    KmsSecretProvider,
    JwtTokenService,
    StepUpGuard,
    CsrfMiddleware,
    {
        provide: SECRET_PROVIDER,
        useFactory: async (defaultP: DefaultSecretProvider, vaultP: VaultSecretProvider, kmsP: KmsSecretProvider) => {
            await vaultP.initialize();
            await kmsP.initialize();
            return new CompositeSecretProvider([vaultP, kmsP, defaultP]);
        },
        inject: [DefaultSecretProvider, VaultSecretProvider, KmsSecretProvider]
    }
  ],
  exports: [TenantContextMiddleware, TenantGuard, SecretManagerService, JwtTokenService, StepUpGuard, PassportModule, JwtModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware, CsrfMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
