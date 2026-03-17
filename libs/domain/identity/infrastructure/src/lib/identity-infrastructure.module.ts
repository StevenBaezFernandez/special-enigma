import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserRepository, CompanyRepository, AuditLogRepository, SessionRepository, JobTitleRepository, AuthService, NotificationService, RiskEngineService, CachePort, RiskEvaluatorService, WebAuthnService } from '@virteex/domain-identity-domain';

import { MikroOrmUserRepository } from './persistence/mikro-orm-user.repository';
import { UserSchema, CompanySchema, AuditLogSchema, SessionSchema, JobTitleSchema, UserAuthenticatorSchema } from './persistence/identity.schemas';
import { MikroOrmCompanyRepository } from './persistence/mikro-orm-company.repository';
import { MikroOrmAuditLogRepository } from './persistence/mikro-orm-audit-log.repository';
import { MikroOrmSessionRepository } from './persistence/mikro-orm-session.repository';
import { MikroOrmJobTitleRepository } from './persistence/mikro-orm-job-title.repository';

import { Argon2AuthService } from './services/argon2-auth.service';
import { KeycloakAuthService } from './services/keycloak-auth.service';
import { WebAuthnService as InfrastructureWebAuthnService } from './services/webauthn.service';
import { SessionSerializer } from './services/session.serializer';
import { GoogleStrategy } from './strategies/google.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { OktaStrategy } from './strategies/okta.strategy';
import { NodemailerNotificationService } from './services/nodemailer-notification.service';
import { DefaultRiskEngineService } from './services/risk-engine.service';
import { MailQueueProducer } from './services/mail-queue.producer';
import { MailProcessor } from './services/mail.processor';
import { GeoIpLiteAdapter } from './adapters/geo-ip-lite.adapter';
import { GEO_IP_PORT } from '@virteex/domain-identity-domain';

import {
  LoginUserUseCase,
  VerifyMfaUseCase,
  StoragePort,
  GetUserProfileUseCase,
  UpdateUserProfileUseCase,
  InviteUserUseCase,
  UploadAvatarUseCase,
  ListTenantsUseCase,
  UserInvitedListener,
  RefreshTokenUseCase,
  InitiateSignupUseCase,
  VerifySignupUseCase,
  CompleteOnboardingUseCase,
  UpdateSubscriptionUseCase,
  GetSubscriptionStatusUseCase,
  TokenGenerationService,
  GetJobTitlesUseCase,
  CheckSecurityContextUseCase,
  LogoutUserUseCase,
  HandleSocialLoginUseCase,
  GeneratePasskeyRegistrationOptionsUseCase,
  VerifyPasskeyRegistrationUseCase,
  GeneratePasskeyLoginOptionsUseCase,
  VerifyPasskeyLoginUseCase
} from '@virteex/domain-identity-application';
import { SharedInfrastructureStorageModule } from '@virteex/platform-storage';
import { StorageAdapter } from './adapters/storage.adapter';
import { RedisCacheModule } from '@virteex/platform-cache';
import { RedisCacheAdapter } from './adapters/redis-cache.adapter';
import { AuthModule } from '@virteex/kernel-auth';

@Global()
@Module({
  imports: [
    ConfigModule,
    EventEmitterModule,
    AuthModule,
    MikroOrmModule.forFeature([UserSchema, CompanySchema, AuditLogSchema, SessionSchema, JobTitleSchema, UserAuthenticatorSchema]),
    SharedInfrastructureStorageModule,
    RedisCacheModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const url = configService.get<string>('REDIS_URL');
        if (url) {
           return url as any;
        }
        return {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          password: configService.get<string>('REDIS_PASSWORD'),
        };
      },
    }),
  ],
  providers: [
    MailQueueProducer,
    MailProcessor,
    UserInvitedListener,
    { provide: UserRepository, useClass: MikroOrmUserRepository },
    { provide: CompanyRepository, useClass: MikroOrmCompanyRepository },
    { provide: AuditLogRepository, useClass: MikroOrmAuditLogRepository },
    { provide: SessionRepository, useClass: MikroOrmSessionRepository },
    { provide: JobTitleRepository, useClass: MikroOrmJobTitleRepository },
    Argon2AuthService,
    KeycloakAuthService,
    { provide: WebAuthnService, useClass: InfrastructureWebAuthnService },
    SessionSerializer,
    GoogleStrategy,
    MicrosoftStrategy,
    OktaStrategy,
    {
        provide: AuthService,
        useFactory: (config: ConfigService, argon: Argon2AuthService, keycloak: KeycloakAuthService) => {
            const type = config.get('AUTH_STRATEGY', 'argon2');
            return type === 'keycloak' ? keycloak : argon;
        },
        inject: [ConfigService, Argon2AuthService, KeycloakAuthService]
    },
    { provide: NotificationService, useClass: NodemailerNotificationService },
    { provide: RiskEngineService, useClass: DefaultRiskEngineService },
    RiskEvaluatorService,
    { provide: StoragePort, useClass: StorageAdapter },
    { provide: GEO_IP_PORT, useClass: GeoIpLiteAdapter },
    { provide: CachePort, useClass: RedisCacheAdapter },
    InitiateSignupUseCase,
    VerifySignupUseCase,
    CompleteOnboardingUseCase,
    LoginUserUseCase,
    VerifyMfaUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    InviteUserUseCase,
    UploadAvatarUseCase,
    ListTenantsUseCase,
    RefreshTokenUseCase,
    UpdateSubscriptionUseCase,
    GetSubscriptionStatusUseCase,
      TokenGenerationService,
    GetJobTitlesUseCase,
    CheckSecurityContextUseCase,
    LogoutUserUseCase,
    HandleSocialLoginUseCase,
    GeneratePasskeyRegistrationOptionsUseCase,
    VerifyPasskeyRegistrationUseCase,
    GeneratePasskeyLoginOptionsUseCase,
    VerifyPasskeyLoginUseCase
  ],
  exports: [
    InitiateSignupUseCase,
    VerifySignupUseCase,
    CompleteOnboardingUseCase,
    LoginUserUseCase,
    VerifyMfaUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    InviteUserUseCase,
    UploadAvatarUseCase,
    ListTenantsUseCase,
    RefreshTokenUseCase,
    UpdateSubscriptionUseCase,
    GetSubscriptionStatusUseCase,
      TokenGenerationService,
    GetJobTitlesUseCase,
    CheckSecurityContextUseCase,
    LogoutUserUseCase,
    HandleSocialLoginUseCase,
    GeneratePasskeyRegistrationOptionsUseCase,
    VerifyPasskeyRegistrationUseCase,
    GeneratePasskeyLoginOptionsUseCase,
    VerifyPasskeyLoginUseCase,
    StoragePort,
    UserRepository,
    CompanyRepository,
    AuditLogRepository,
    SessionRepository,
    JobTitleRepository,
    AuthService,
    WebAuthnService,
    RiskEngineService,
    RiskEvaluatorService,
    CachePort,
    GEO_IP_PORT
  ]
})
export class IdentityInfrastructureModule {}
