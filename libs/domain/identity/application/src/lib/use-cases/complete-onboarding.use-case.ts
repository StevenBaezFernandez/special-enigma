import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
    AuthService,
    NotificationService,
    UserRepository,
    CompanyRepository,
    AuditLogRepository,
    AuditLog,
    RiskEngineService,
    User,
    Company,
    SessionRepository,
    CachePort,
    UNIT_OF_WORK_PORT,
    UnitOfWorkPort
} from '@virteex/domain-identity-domain';
import { Tenant, TenantMode } from '@virteex/kernel-tenant';
import { TokenGenerationService } from '../services/token-generation.service';
import { CompleteOnboardingDto } from '@virteex/domain-identity-contracts';
import { TaxIdValidator, RecaptchaPort } from '@virteex/domain-identity-domain';

@Injectable()
export class CompleteOnboardingUseCase {
  private readonly logger = new Logger(CompleteOnboardingUseCase.name);
  private readonly taxIdValidator = new TaxIdValidator();

  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(CompanyRepository) private readonly companyRepository: CompanyRepository,
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(NotificationService) private readonly notificationService: NotificationService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
    @Inject(RiskEngineService) private readonly riskEngineService: RiskEngineService,
    @Inject(CachePort) private readonly cachePort: CachePort,
    @Inject(UNIT_OF_WORK_PORT) private readonly uow: UnitOfWorkPort,
    @Inject(TokenGenerationService) private readonly tokenGenerationService: TokenGenerationService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(RecaptchaPort) private readonly recaptchaService: RecaptchaPort
  ) {}

  async execute(dto: CompleteOnboardingDto, context: { ip: string, userAgent: string }) {
    if (!(await this.recaptchaService.verify(dto.recaptchaToken, 'completeOnboarding'))) {
        throw new DomainException('reCAPTCHA verification failed', 'INVALID_CAPTCHA');
    }

    let email: string;
    try {
        const payload = await this.authService.verifyToken(dto.onboardingToken);
        if (!payload.verified || payload.scope !== 'onboarding') {
            throw new Error();
        }
        email = payload.email;
    } catch {
        throw new DomainException('Invalid or expired onboarding token', 'UNAUTHORIZED');
    }

    const key = `signup:${email}`;
    const storedData = await this.cachePort.get(key);
    if (!storedData) {
        throw new DomainException('Signup session expired. Please restart.', 'BAD_REQUEST');
    }

    const { passwordHash } = JSON.parse(storedData);

    // Validate Tax ID format
    this.taxIdValidator.validate(dto.country, dto.taxId);

    // Validate Duplicate Tax ID
    if (await this.companyRepository.existsByTaxId(dto.taxId)) {
        throw new DomainException(`Company with Tax ID ${dto.taxId} already exists.`, 'CONFLICT');
    }

    const result = await this.uow.runInTransaction(async () => {
        const company = new Company(dto.companyName, dto.taxId, dto.country);
        const baseSettings: any = { fiscalRegime: dto.regime };
        if (dto.fiscalRegionId) {
            baseSettings.fiscalRegionId = dto.fiscalRegionId;
        }

        if (dto.country === 'CO') {
            company.settings = { ...baseSettings, taxProvider: 'DIAN' };
            company.currency = 'COP';
        } else if (dto.country === 'MX') {
             company.settings = { ...baseSettings, taxProvider: 'SAT' };
             company.currency = 'MXN';
        } else {
             company.settings = baseSettings;
             company.currency = 'USD';
        }

        await this.companyRepository.save(company);

        const tenant = new Tenant();
        tenant.id = company.id;
        tenant.mode = TenantMode.SHARED;
        tenant.plan = 'TRIAL';
        tenant.createdAt = new Date();
        tenant.updatedAt = new Date();

        const user = new User(
            email,
            passwordHash,
            dto.firstName,
            dto.lastName,
            dto.country,
            company
        );
        user.role = 'admin';
        user.phone = dto.phone;
        user.isActive = true;

        const rawSecret = this.authService.generateMfaSecret();
        user.mfaSecret = await this.authService.encrypt(rawSecret);
        user.mfaEnabled = false;

        await this.userRepository.save(user);

        return { user, company, rawSecret };
    });

    const { user, rawSecret } = result;

    await this.cachePort.del(key);

    this.eventEmitter.emit('tenant.created', { tenantId: user.company.id });

    const { accessToken, refreshToken, expiresIn } = await this.tokenGenerationService.createSessionAndTokens(user, context, 0);

    await this.auditLogRepository.save(new AuditLog('REGISTER_SUCCESS', user.id, { ip: context.ip }));

    try {
        await this.notificationService.sendWelcomeEmail(user);
    } catch (e) {
        this.logger.error(`Failed to send welcome email to ${user.email} after successful registration`, e);
    }

    return {
        accessToken,
        refreshToken,
        expiresIn,
        mfaSecret: rawSecret,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            companyName: user.company.name
        }
    };
  }
}
