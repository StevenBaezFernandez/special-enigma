import { Injectable, Inject, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AuthService, NotificationService, UserRepository, CompanyRepository,
  AuditLogRepository, AuditLog, RiskEngineService,
  User, Company, Session, SessionRepository, CachePort
} from '@virteex/domain-identity-domain';
import { Tenant, TenantMode } from '@virteex/kernel-tenant';
import { EntityManager } from '@mikro-orm/core';
import * as crypto from 'crypto';
import { TokenGenerationService } from '../services/token-generation.service';
import { CompleteOnboardingDto } from '@virteex/contracts-identity-contracts';

@Injectable()
export class CompleteOnboardingUseCase {
  constructor(
    @Inject(UserRepository) private readonly userRepository: UserRepository,
    @Inject(CompanyRepository) private readonly companyRepository: CompanyRepository,
    @Inject(SessionRepository) private readonly sessionRepository: SessionRepository,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(NotificationService) private readonly notificationService: NotificationService,
    @Inject(AuditLogRepository) private readonly auditLogRepository: AuditLogRepository,
    @Inject(RiskEngineService) private readonly riskEngineService: RiskEngineService,
    @Inject(CachePort) private readonly cachePort: CachePort,
    private readonly em: EntityManager,
    @Inject(TokenGenerationService) private readonly tokenGenerationService: TokenGenerationService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(dto: CompleteOnboardingDto, context: { ip: string, userAgent: string }) {
    let email: string;
    try {
        const payload = await this.authService.verifyToken(dto.onboardingToken);
        if (!payload.verified || payload.scope !== 'onboarding') {
            throw new Error();
        }
        email = payload.email;
    } catch {
        throw new UnauthorizedException('Invalid or expired onboarding token');
    }

    const key = `signup:${email}`;
    const storedData = await this.cachePort.get(key);
    if (!storedData) {
        throw new BadRequestException('Signup session expired. Please restart.');
    }

    const { passwordHash } = JSON.parse(storedData);

    // Validate Tax ID format
    this.validateTaxId(dto.country, dto.taxId);

    // Validate Duplicate Tax ID
    const existingCompany = await this.companyRepository.findByTaxId(dto.taxId);
    if (existingCompany) {
        throw new BadRequestException('Company with this Tax ID already exists.');
    }

    const result = await this.em.transactional(async (em) => {
        const company = new Company(dto.companyName, dto.taxId, dto.country);
        if (dto.country === 'CO') {
            company.settings = { fiscalRegime: dto.regime, taxProvider: 'DIAN' };
            company.currency = 'COP';
        } else if (dto.country === 'MX') {
             company.settings = { fiscalRegime: dto.regime, taxProvider: 'SAT' };
             company.currency = 'MXN';
        } else {
             company.settings = { fiscalRegime: dto.regime };
             company.currency = 'USD';
        }

        em.persist(company);

        // -----------------------------------------------------
        // CRITICAL: Create the Infrastructure Tenant record
        // This ensures the TenantMiddleware can resolve the context later.
        // -----------------------------------------------------
        const tenant = new Tenant();
        tenant.id = company.id; // Sync Business ID with Infrastructure ID
        tenant.mode = TenantMode.SHARED; // Default for new signups
        tenant.plan = 'TRIAL';
        tenant.createdAt = new Date();
        tenant.updatedAt = new Date();

        em.persist(tenant);

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
        user.mfaEnabled = true;

        em.persist(user);

        return { user, company, rawSecret };
    });

    const { user } = result;

    await this.cachePort.del(key);

    // Emit event to notify other domains to initialize tenant data (e.g. Accounting)
    this.eventEmitter.emit('tenant.created', { tenantId: user.company.id });

    const { accessToken, refreshToken, expiresIn } = await this.tokenGenerationService.createSessionAndTokens(user, context, 0);

    await this.auditLogRepository.save(new AuditLog('REGISTER_SUCCESS', user.id, { ip: context.ip }));

    // Send Welcome Email
    try {
        await this.notificationService.sendWelcomeEmail(user);
    } catch (e) {
        // Non-blocking error
        console.error('Failed to queue welcome email', e);
    }

    return {
        accessToken,
        refreshToken,
        expiresIn,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            companyName: user.company.name
        }
    };
  }

  private validateTaxId(country: string, taxId: string): void {
    const countryCode = country.toUpperCase();
    let isValid = true;
    let errorMsg = '';

    switch (countryCode) {
      case 'CO': {
        const nit = taxId.replace(/[^0-9]/g, '');
        if (!/^\d{9,10}$/.test(nit)) {
          isValid = false;
          errorMsg = 'Invalid NIT for Colombia. Must be 9-10 digits.';
        }
        break;
      }
      case 'MX': {
        const rfc = taxId.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (rfc.length < 12 || rfc.length > 13) {
             isValid = false;
             errorMsg = 'Invalid RFC for Mexico. Must be 12-13 alphanumeric characters.';
        } else if (!/^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/.test(rfc)) {
             isValid = false;
             errorMsg = 'Invalid RFC format.';
        }
        break;
      }
      case 'US': {
        const ein = taxId.replace(/[^0-9]/g, '');
        if (!/^\d{9}$/.test(ein)) {
          isValid = false;
          errorMsg = 'Invalid EIN for USA. Must be 9 digits.';
        }
        break;
      }
      default:
        if (taxId.length < 5) {
            isValid = false;
            errorMsg = 'Tax ID too short.';
        }
        break;
    }

    if (!isValid) {
      throw new BadRequestException(errorMsg);
    }
  }
}
