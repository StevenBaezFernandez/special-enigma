import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CanonicalTenantMiddleware } from './middleware/canonical-tenant.middleware';
import { TenantGuard } from './guards/tenant.guard';
import { TelemetryModule } from '@virteex/kernel-telemetry-interfaces';
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
    CanonicalTenantMiddleware,
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
            const isTest = process.env['NODE_ENV'] === 'test';
            if (!isTest) {
                await vaultP.initialize();
                await kmsP.initialize();
            }
            return new CompositeSecretProvider([vaultP, kmsP, defaultP]);
        },
        inject: [DefaultSecretProvider, VaultSecretProvider, KmsSecretProvider]
    }
  ],
  exports: [CanonicalTenantMiddleware, TenantGuard, SecretManagerService, JwtTokenService, StepUpGuard, PassportModule, JwtModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CanonicalTenantMiddleware, CsrfMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
