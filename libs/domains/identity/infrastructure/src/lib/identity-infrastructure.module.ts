import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  UserRepository, CompanyRepository, AuditLogRepository, SessionRepository, JobTitleRepository,
  AuthService, NotificationService, RiskEngineService,
  User, Company, AuditLog, Session, JobTitle
} from '@virteex/identity-domain';

import { MikroOrmUserRepository } from './persistence/mikro-orm-user.repository';
import { MikroOrmCompanyRepository } from './persistence/mikro-orm-company.repository';
import { MikroOrmAuditLogRepository } from './persistence/mikro-orm-audit-log.repository';
import { MikroOrmSessionRepository } from './persistence/mikro-orm-session.repository';
import { MikroOrmJobTitleRepository } from './persistence/mikro-orm-job-title.repository';

import { NodeCryptoAuthService } from './services/node-crypto-auth.service';
import { NodemailerNotificationService } from './services/nodemailer-notification.service';
import { DefaultRiskEngineService } from './services/risk-engine.service';
import { MailQueueProducer } from './services/mail-queue.producer';
import { MailProcessor } from './services/mail.processor';
import { GeoIpLiteAdapter } from './adapters/geo-ip-lite.adapter';
import { GEO_IP_PORT } from '@virteex/identity-domain';

import {
  RegisterUserUseCase, LoginUserUseCase, VerifyMfaUseCase, StoragePort,
  GetUserProfileUseCase, UpdateUserProfileUseCase, InviteUserUseCase, UploadAvatarUseCase,
  ListTenantsUseCase, UserInvitedListener, RefreshTokenUseCase
} from '@virteex/identity-application';
import { SharedInfrastructureStorageModule } from '@virteex/shared-infrastructure-storage';
import { StorageAdapter } from './adapters/storage.adapter';

@Global()
@Module({
  imports: [
    ConfigModule,
    EventEmitterModule,
    MikroOrmModule.forFeature([User, Company, AuditLog, Session, JobTitle]),
    SharedInfrastructureStorageModule
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

    { provide: AuthService, useClass: NodeCryptoAuthService },
    { provide: NotificationService, useClass: NodemailerNotificationService },
    { provide: RiskEngineService, useClass: DefaultRiskEngineService },
    { provide: StoragePort, useClass: StorageAdapter },
    { provide: GEO_IP_PORT, useClass: GeoIpLiteAdapter },

    // Application Use Cases
    RegisterUserUseCase,
    LoginUserUseCase,
    VerifyMfaUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    InviteUserUseCase,
    UploadAvatarUseCase,
    ListTenantsUseCase,
    RefreshTokenUseCase
  ],
  exports: [
    RegisterUserUseCase,
    LoginUserUseCase,
    VerifyMfaUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    InviteUserUseCase,
    UploadAvatarUseCase,
    ListTenantsUseCase,
    RefreshTokenUseCase,
    StoragePort,
    // Export ports if other modules need them directly
    UserRepository,
    CompanyRepository,
    AuditLogRepository,
    SessionRepository,
    JobTitleRepository,
    AuthService,
    RiskEngineService
  ]
})
export class IdentityInfrastructureModule {}
