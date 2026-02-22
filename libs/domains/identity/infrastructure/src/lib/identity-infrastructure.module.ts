import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  UserRepository, CompanyRepository, AuditLogRepository, SessionRepository, JobTitleRepository,
  AuthService, NotificationService, RiskEngineService, CachePort,
  User, Company, AuditLog, Session, JobTitle
} from '@virteex/identity-domain';

import { MikroOrmUserRepository } from './persistence/mikro-orm-user.repository';
import { MikroOrmCompanyRepository } from './persistence/mikro-orm-company.repository';
import { MikroOrmAuditLogRepository } from './persistence/mikro-orm-audit-log.repository';
import { MikroOrmSessionRepository } from './persistence/mikro-orm-session.repository';
import { MikroOrmJobTitleRepository } from './persistence/mikro-orm-job-title.repository';

import { Argon2AuthService } from './services/argon2-auth.service';
import { NodemailerNotificationService } from './services/nodemailer-notification.service';
import { DefaultRiskEngineService } from './services/risk-engine.service';
import { MailQueueProducer } from './services/mail-queue.producer';
import { MailProcessor } from './services/mail.processor';
import { GeoIpLiteAdapter } from './adapters/geo-ip-lite.adapter';
import { GEO_IP_PORT } from '@virteex/identity-domain';

import {
  LoginUserUseCase, VerifyMfaUseCase, StoragePort,
  GetUserProfileUseCase, UpdateUserProfileUseCase, InviteUserUseCase, UploadAvatarUseCase,
  ListTenantsUseCase, UserInvitedListener, RefreshTokenUseCase,
  InitiateSignupUseCase, VerifySignupUseCase, CompleteOnboardingUseCase,
  UpdateSubscriptionUseCase, GetSubscriptionStatusUseCase, // Added
  TokenGenerationService
} from '@virteex/identity-application';
import { SharedInfrastructureStorageModule } from '@virteex/shared-infrastructure-storage';
import { StorageAdapter } from './adapters/storage.adapter';
import { RedisCacheModule } from '@virteex/shared/infrastructure/cache';
import { RedisCacheAdapter } from './adapters/redis-cache.adapter';
import { AuthModule } from '@virteex/auth';

@Global()
@Module({
  imports: [
    ConfigModule,
    EventEmitterModule,
    AuthModule,
    MikroOrmModule.forFeature([User, Company, AuditLog, Session, JobTitle]),
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
    // Queue Services
    MailQueueProducer,
    MailProcessor,

    // Application Listeners
    UserInvitedListener,

    // Ports Implementations
    { provide: UserRepository, useClass: MikroOrmUserRepository },
    { provide: CompanyRepository, useClass: MikroOrmCompanyRepository },
    { provide: AuditLogRepository, useClass: MikroOrmAuditLogRepository },
    { provide: SessionRepository, useClass: MikroOrmSessionRepository },
    { provide: JobTitleRepository, useClass: MikroOrmJobTitleRepository },

    { provide: AuthService, useClass: Argon2AuthService },
    { provide: NotificationService, useClass: NodemailerNotificationService },
    { provide: RiskEngineService, useClass: DefaultRiskEngineService },
    { provide: StoragePort, useClass: StorageAdapter },
    { provide: GEO_IP_PORT, useClass: GeoIpLiteAdapter },
    { provide: CachePort, useClass: RedisCacheAdapter },

    // Application Use Cases
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
    TokenGenerationService
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
    StoragePort,
    UserRepository,
    CompanyRepository,
    AuditLogRepository,
    SessionRepository,
    JobTitleRepository,
    AuthService,
    RiskEngineService,
    CachePort
  ]
})
export class IdentityInfrastructureModule {}
